// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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

export const Artifact = createTable("artifact", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  chatId: varchar("chat_id", { length: 255 })
    .references(() => Chat.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const ArtifactVersion = createTable("artifact_version", {
  id: varchar("id", { length: 255 }).primaryKey(),
  content: text("content").notNull(),
  versionNumber: integer("version_number").notNull(),
  artifactId: varchar("artifact_id", { length: 255 })
    .references(() => Artifact.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const chatRelations = relations(Chat, ({ many }) => ({
  messages: many(Message),
}));

export const MessageRole = pgEnum("message_role", [
  "user",
  "assistant",
  "tool",
]);

export const Message = createTable("message", {
  id: varchar("id", { length: 255 }).primaryKey(),
  role: MessageRole("role").notNull(),
  content: text("content"),
  toolCallId: varchar("tool_call_id", { length: 255 }),
  toolCalls: jsonb("tool_calls").$type<unknown[]>(),
  chatId: varchar("chat_id", { length: 255 })
    .references(() => Chat.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Message = typeof Message.$inferSelect;
export type MessageInsert = typeof Message.$inferInsert;
export const MessageSchema = createSelectSchema(Message, {
  toolCalls: z.array(z.unknown()).nullable(),
  createdAt: z.coerce.date(),
});
export const MessageInsertSchema = createInsertSchema(Message, {
  toolCalls: z.array(z.unknown()).nullish(),
  createdAt: z.coerce.date().nullish(),
});

export const messageRelations = relations(Message, ({ one }) => ({
  chat: one(Chat, {
    fields: [Message.chatId],
    references: [Chat.id],
  }),
}));
