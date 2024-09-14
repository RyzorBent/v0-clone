import { timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createTable } from "../db/create-table";
import { Message } from "../messages/message.sql";

export const Chat = createTable("chat", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Chat = typeof Chat.$inferSelect;
export type ChatInsert = typeof Chat.$inferInsert;

export const chatRelations = relations(Chat, ({ many }) => ({
  messages: many(Message),
}));
