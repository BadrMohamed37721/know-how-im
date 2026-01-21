import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Set up Object Storage
  registerObjectStorageRoutes(app);

  // Serve static files from object storage (alternative to the /api/objects route)
  // This helps if the frontend is trying to access /objects/ directly
  app.get("/objects/uploads/:filename", (req, res) => {
    res.redirect(`/api/objects/uploads/${req.params.filename}`);
  });

  // === Public Routes ===
  app.get(api.profiles.getBySlug.path, async (req, res) => {
    const profile = await storage.getProfileBySlug(req.params.slug);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  // === Protected Routes ===
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  app.get(api.profiles.me.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;

    let profile = await storage.getProfileByUserId(userId);
    if (!profile) {
      const email = user.claims.email || "";
      const suggestedSlug = email ? email.split("@")[0] : userId.slice(0, 8);

      profile = await storage.createProfile({
        userId: userId,
        displayName: user.claims.first_name || suggestedSlug,
        slug: suggestedSlug,
        bio: "Welcome to my digital card!",
        themeColor: "#000000",
        backgroundColor: "#ffffff",
      });
    }
    const links = await storage.getLinks(profile.id);
    res.json({ ...profile, links });
  });

  app.patch(api.profiles.update.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.profiles.update.input.parse(req.body);
    const updated = await storage.updateProfile(profile.id, input);
    res.json(updated);
  });

  app.post(api.links.create.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.links.create.input.parse(req.body);
    const link = await storage.createLink({ ...input, profileId: profile.id });
    res.status(201).json(link);
  });

  app.patch(api.links.update.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    const input = api.links.update.input.parse(req.body);
    const link = await storage.updateLink(Number(req.params.id), input);
    res.json(link);
  });

  app.delete(api.links.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    await storage.deleteLink(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.links.reorder.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const { linkIds } = req.body;
    const links = await storage.reorderLinks(profile.id, linkIds);
    res.json(links);
  });

  // === Admin Routes ===
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    // Specific check for your Gmail
    if (
      user.claims.email !== "badrdiab2020@gmail.com" &&
      !user.claims.is_admin
    ) {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
    next();
  };

  app.get("/api/admin/tags", requireAdmin, async (req, res) => {
    const tags = await storage.getAllTags();
    res.json(tags);
  });

  app.post("/api/admin/verify-tag", requireAdmin, async (req, res) => {
    const admin = req.user as any;
    const { tagId } = req.body;
    if (!tagId) return res.status(400).json({ message: "Tag ID is required" });
    const tag = await storage.verifyTag(tagId, admin.claims.email);
    res.json(tag);
  });

  app.get("/api/nfc/check/:tagId", async (req, res) => {
    const isVerified = await storage.isTagVerified(req.params.tagId);
    res.json({ isVerified });
  });

  return httpServer;
}
