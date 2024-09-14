import { relations } from "drizzle-orm";
import { jsonb, pgEnum, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Chat } from "../chat/chat.sql";
import { createTable } from "../db/create-table";

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
