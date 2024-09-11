// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `project-4-v0_${name}`);

export const User = createTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  githubId: integer("github_id").unique(),
  username: varchar("username", { length: 255 }),
});

export type User = typeof User.$inferSelect;

export const Session = createTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => User.id)
    .notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export type Session = typeof Session.$inferSelect;
