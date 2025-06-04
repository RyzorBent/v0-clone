import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { Actor } from "../actor";
import { withTransaction } from "../db/transaction";
import { APIError } from "../error";
import { chats } from "./chat.sql";
export var Chat;
(function (Chat) {
    Chat.PatchInput = z.object({
        title: z.string().optional(),
        public: z.boolean().optional(),
    });
    async function list() {
        return await withTransaction(async (tx) => {
            const { userId } = Actor.useUser();
            return await tx
                .select()
                .from(chats)
                .where(eq(chats.userId, userId))
                .orderBy(desc(chats.updatedAt));
        });
    }
    Chat.list = list;
    async function get(chatId) {
        return await withTransaction(async (tx) => {
            const actor = Actor.use();
            const chat = await tx.query.chats.findFirst({
                where: and(eq(chats.id, chatId), actor.type === "user"
                    ? eq(chats.userId, actor.userId)
                    : eq(chats.public, true)),
            });
            return chat;
        });
    }
    Chat.get = get;
    async function create() {
        return await withTransaction(async (tx) => {
            const actor = Actor.useUser();
            const [chat] = await tx
                .insert(chats)
                .values({ userId: actor.userId })
                .returning();
            return chat;
        });
    }
    Chat.create = create;
    async function patch(chatId, input) {
        return await withTransaction(async (tx) => {
            const actor = Actor.useUser();
            await tx
                .update(chats)
                .set(input)
                .where(and(eq(chats.id, chatId), eq(chats.userId, actor.userId)));
        });
    }
    Chat.patch = patch;
    async function del(id) {
        return await withTransaction(async (tx) => {
            const actor = Actor.useUser();
            await tx
                .delete(chats)
                .where(and(eq(chats.id, id), eq(chats.userId, actor.userId)));
        });
    }
    Chat.del = del;
    async function touch(id) {
        return await withTransaction(async (tx) => {
            const actor = Actor.useUser();
            const [chat] = await tx
                .update(chats)
                .set({ updatedAt: new Date() })
                .where(eq(chats.id, id))
                .returning({ userId: chats.userId });
            if (chat.userId !== actor.userId) {
                throw APIError.unauthorized();
            }
        });
    }
    Chat.touch = touch;
})(Chat || (Chat = {}));
