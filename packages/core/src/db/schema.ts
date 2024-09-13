// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  pgEnum,
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

export const Chat = createTable("chat", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Chat = typeof Chat.$inferSelect;

export const chatRelations = relations(Chat, ({ many }) => ({
  messages: many(Message),
}));

export const MessageRole = pgEnum("message_role", ["user", "assistant"]);

export const Message = createTable("message", {
  id: varchar("id", { length: 255 }).primaryKey(),
  role: MessageRole("role").notNull(),
  content: text("content").notNull(),
  chatId: varchar("chat_id", { length: 255 })
    .references(() => Chat.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Message = typeof Message.$inferSelect;

export const messageRelations = relations(Message, ({ one }) => ({
  chat: one(Chat, {
    fields: [Message.chatId],
    references: [Chat.id],
  }),
}));
