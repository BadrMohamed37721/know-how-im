import { users, type User, type UpsertUser } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { storage } from "../../storage";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    return storage.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return storage.upsertUser(userData);
  }
}

export const authStorage = new AuthStorage();
