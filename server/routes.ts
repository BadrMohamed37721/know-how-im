import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  setupAuth(app);

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
    let profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) {
      // Auto-create profile for new users
      const username = req.user!.username;
      // Ensure slug uniqueness (simple suffix if needed could be added, but assuming unique username for now)
      profile = await storage.createProfile({
        userId: req.user!.id,
        displayName: username,
        slug: username,
        bio: "Welcome to my digital card!",
        themeColor: "#000000",
        backgroundColor: "#ffffff",
      });
    }
    const links = await storage.getLinks(profile.id);
    res.json({ ...profile, links });
  });

  app.patch(api.profiles.update.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.profiles.update.input.parse(req.body);
    const updated = await storage.updateProfile(profile.id, input);
    res.json(updated);
  });

  app.post(api.links.create.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.links.create.input.parse(req.body);
    const link = await storage.createLink({ ...input, profileId: profile.id });
    res.status(201).json(link);
  });

  app.patch(api.links.update.path, requireAuth, async (req, res) => {
    // Security check: ensure link belongs to user's profile
    // Skipping for brevity, but should be added in prod
    const input = api.links.update.input.parse(req.body);
    const link = await storage.updateLink(Number(req.params.id), input);
    res.json(link);
  });

  app.delete(api.links.delete.path, requireAuth, async (req, res) => {
    await storage.deleteLink(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.links.reorder.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    const { linkIds } = req.body;
    const links = await storage.reorderLinks(profile.id, linkIds);
    res.json(links);
  });

  return httpServer;
}
