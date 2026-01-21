import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Combined schema to avoid conflicts between shared/schema.ts and shared/models/auth.ts
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(), // Keep this for profile logic
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  qrToken: text("qr_token"),
  qrExpiresAt: timestamp("qr_expires_at"),
  isActivated: boolean("is_activated").default(false), // New field for NFC activation
  activationDate: timestamp("activation_date"),
  activatedBy: varchar("activated_by"), // email of the admin who activated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  phoneNumber: text("phone_number"),
  slug: text("slug").notNull().unique(),
  avatarUrl: text("avatar_url"),
  themeColor: text("theme_color").default("#000000"),
  backgroundColor: text("background_color").default("#ffffff"),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
});

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  profile: one(profiles, {
    fields: [links.profileId],
    references: [profiles.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true });
export const insertLinkSchema = createInsertSchema(links).omit({ id: true, profileId: true });

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Link = typeof links.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type UpsertUser = typeof users.$inferInsert;
