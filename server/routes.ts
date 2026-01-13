import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Mock user ID for testing without auth
  const MOCK_USER_ID = "test-user-id";

  // Setup mock user in storage if doesn't exist
  await storage.upsertUser({
    id: MOCK_USER_ID,
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
  });

  // === Public Routes ===
  app.get(api.profiles.getBySlug.path, async (req, res) => {
    const profile = await storage.getProfileBySlug(req.params.slug);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  // === Dashboard Routes (Auth Disabled for Testing) ===
  app.get(api.profiles.me.path, async (req, res) => {
    let profile = await storage.getProfileByUserId(MOCK_USER_ID);
    if (!profile) {
      profile = await storage.createProfile({
        userId: MOCK_USER_ID,
        displayName: "Test User",
        slug: "testuser",
        bio: "Welcome to my digital card!",
        themeColor: "#000000",
        backgroundColor: "#ffffff",
      });
    }
    const links = await storage.getLinks(profile.id);
    res.json({ ...profile, links });
  });

  app.patch(api.profiles.update.path, async (req, res) => {
    const profile = await storage.getProfileByUserId(MOCK_USER_ID);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.profiles.update.input.parse(req.body);
    const updated = await storage.updateProfile(profile.id, input);
    res.json(updated);
  });

  app.post(api.links.create.path, async (req, res) => {
    const profile = await storage.getProfileByUserId(MOCK_USER_ID);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const input = api.links.create.input.parse(req.body);
    const link = await storage.createLink({ ...input, profileId: profile.id });
    res.status(201).json(link);
  });

  app.patch(api.links.update.path, async (req, res) => {
    const input = api.links.update.input.parse(req.body);
    const link = await storage.updateLink(Number(req.params.id), input);
    res.json(link);
  });

  app.delete(api.links.delete.path, async (req, res) => {
    await storage.deleteLink(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.links.reorder.path, async (req, res) => {
    const profile = await storage.getProfileByUserId(MOCK_USER_ID);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    const { linkIds } = req.body;
    const links = await storage.reorderLinks(profile.id, linkIds);
    res.json(links);
  });

  return httpServer;
}
