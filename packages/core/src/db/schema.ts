// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

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
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type User = typeof User.$inferSelect;

export const Session = createTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => User.id)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export type Session = typeof Session.$inferSelect;

export const Chat = createTable("chat", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  userId: varchar("user_id", { length: 255 })
    .references(() => User.id)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Chat = typeof Chat.$inferSelect;

export const chatRelations = relations(Chat, ({ many }) => ({
  messages: many(Message),
}));

export const Message = createTable("message", {
  id: varchar("id", { length: 255 }).primaryKey(),
  chatId: varchar("chat_id", { length: 255 })
    .references(() => Chat.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Message = typeof Message.$inferSelect;

export const messageRelations = relations(Message, ({ one }) => ({
  chat: one(Chat, {
    fields: [Message.chatId],
    references: [Chat.id],
  }),
}));
