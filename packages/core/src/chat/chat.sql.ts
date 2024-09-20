import { timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { column, defineTable } from "../db/utils";
import { messages } from "../messages/message.sql";

export const chats = defineTable("chats", {
  id: column.id("id"),
  title: varchar("title", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));
