import { db } from "./db";
import {
  users, profiles, links, nfcInventory,
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
  getProfileBySlug(slug: string): Promise<(Profile & { links: Link[] }) | undefined>;
  createProfile(profile: InsertProfile & { userId: string }): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile>;

  // Links
  getLinks(profileId: number): Promise<Link[]>;
  createLink(link: InsertLink & { profileId: number }): Promise<Link>;
  updateLink(id: number, updates: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: number): Promise<void>;
  reorderLinks(profileId: number, linkIds: number[]): Promise<Link[]>;

  // NFC Inventory
  verifyTag(tagId: string, adminEmail: string): Promise<any>;
  isTagVerified(tagId: string): Promise<boolean>;
  claimTag(tagId: string, userId: string): Promise<boolean>;
  getTagByUserId(userId: string): Promise<any>;
  getTagByTagId(tagId: string): Promise<any>;
  getAllTags(): Promise<any[]>;
  updateUserQR(id: string, token: string | null, expiresAt: Date | null): Promise<User>;
  getUserByQRToken(token: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async updateUserQR(id: string, token: string | null, expiresAt: Date | null): Promise<User> {
    const [user] = await db.update(users)
      .set({ qrToken: token, qrExpiresAt: expiresAt })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByQRToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.qrToken, token));
    return user;
  }

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

  async getProfileBySlug(slug: string): Promise<(Profile & { links: Link[] }) | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    if (!profile) return undefined;
    
    const profileLinks = await db
      .select()
      .from(links)
      .where(eq(links.profileId, profile.id))
      .orderBy(asc(links.order));
      
    return { ...profile, links: profileLinks };
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
  // NFC Inventory
  async verifyTag(tagId: string, adminEmail: string): Promise<any> {
    const [tag] = await db
      .insert(nfcInventory)
      .values({
        tagId,
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminEmail,
      })
      .onConflictDoUpdate({
        target: nfcInventory.tagId,
        set: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: adminEmail,
        },
      })
      .returning();
    return tag;
  }

  async isTagVerified(tagId: string): Promise<boolean> {
    const [tag] = await db.select().from(nfcInventory).where(eq(nfcInventory.tagId, tagId));
    return !!tag?.isVerified;
  }

  async getTagByTagId(tagId: string): Promise<any> {
    const [tag] = await db.select().from(nfcInventory).where(eq(nfcInventory.tagId, tagId));
    return tag;
  }

  async claimTag(tagId: string, userId: string): Promise<boolean> {
    const [tag] = await db.select().from(nfcInventory).where(eq(nfcInventory.tagId, tagId));
    if (!tag || !tag.isVerified) return false;
    if (tag.claimedBy && tag.claimedBy !== userId) return false;
    
    await db.update(nfcInventory)
      .set({ claimedBy: userId })
      .where(eq(nfcInventory.tagId, tagId));
    return true;
  }

  async getTagByUserId(userId: string): Promise<any> {
    const [tag] = await db.select().from(nfcInventory).where(eq(nfcInventory.claimedBy, userId));
    return tag;
  }

  async getAllTags(): Promise<any[]> {
    return await db.select().from(nfcInventory).orderBy(asc(nfcInventory.createdAt));
  }
}

export const storage = new DatabaseStorage();
