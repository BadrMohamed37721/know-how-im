import { db } from "./db";
import {
  users, profiles, links,
  type User, type Profile, type Link,
  type InsertProfile, type InsertLink
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // User (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  upsertUser(user: any): Promise<User>;

  // Profile
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  getProfileBySlug(slug: string): Promise<(Profile & { links: Link[]; isActivated: boolean }) | undefined>;
  createProfile(profile: InsertProfile & { userId: string }): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile>;

  // Links
  getLinks(profileId: number): Promise<Link[]>;
  createLink(link: InsertLink & { profileId: number }): Promise<Link>;
  updateLink(id: number, updates: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: number): Promise<void>;
  reorderLinks(profileId: number, linkIds: number[]): Promise<Link[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<(Profile & { links: Link[]; isActivated: boolean }) | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    if (!profile) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
    
    const profileLinks = await db
      .select()
      .from(links)
      .where(eq(links.profileId, profile.id))
      .orderBy(asc(links.order));
      
    return { ...profile, links: profileLinks, isActivated: !!user?.isActivated };
  }

  async createProfile(profile: InsertProfile & { userId: string }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();
    return updated;
  }

  async getLinks(profileId: number): Promise<Link[]> {
    return await db.select().from(links).where(eq(links.profileId, profileId)).orderBy(asc(links.order));
  }

  async createLink(link: InsertLink & { profileId: number }): Promise<Link> {
    const [newLink] = await db.insert(links).values(link).returning();
    return newLink;
  }

  async updateLink(id: number, updates: Partial<InsertLink>): Promise<Link> {
    const [updated] = await db.update(links).set(updates).where(eq(links.id, id)).returning();
    return updated;
  }

  async deleteLink(id: number): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  }

  async reorderLinks(profileId: number, linkIds: number[]): Promise<Link[]> {
    for (let i = 0; i < linkIds.length; i++) {
      await db.update(links)
        .set({ order: i })
        .where(eq(links.id, linkIds[i]));
    }
    return this.getLinks(profileId);
  }
  async activateUser(id: string, adminEmail: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isActivated: true,
        activationDate: new Date(),
        activatedBy: adminEmail,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
