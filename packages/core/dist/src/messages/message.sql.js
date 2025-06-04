import { relations } from "drizzle-orm";
import { jsonb, pgEnum, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { chats } from "../chat/chat.sql.js";
import { column, defineTable } from "../db/utils.js";
export const messageRole = pgEnum("message_role", [
    "user",
    "assistant",
    "tool",
]);
export const messages = defineTable("messages", {
    id: column.id("id"),
    role: messageRole("role").notNull(),
    content: text("content"),
    toolCallId: varchar("tool_call_id", { length: 255 }),
    toolCalls: jsonb("tool_calls").$type(),
    context: jsonb("context").$type(),
    metadata: jsonb("metadata").$type(),
    chatId: column
        .nanoid("chat_id")
        .references(() => chats.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export const messagesRelations = relations(messages, ({ one }) => ({
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
}));
//# sourceMappingURL=message.sql.js.map