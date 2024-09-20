import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { Actor } from "../actor";
import { db } from "../db";
import { chats } from "./chat.sql";

export type Chat = typeof chats.$inferSelect;

export namespace Chat {
  export const PatchInput = z.object({
    title: z.string().optional(),
  });

  export async function list() {
    const { userId } = Actor.use();
    return await db.select().from(chats).where(eq(chats.userId, userId));
  }

  export async function get(chatId: string) {
    const { userId } = Actor.use();
    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    return chat;
  }

  export async function create() {
    const { userId } = Actor.use();
    const [chat] = await db.insert(chats).values({ userId }).returning();
    return chat;
  }

  export async function patch(
    chatId: string,
    input: z.infer<typeof PatchInput>
  ) {
    const { userId } = Actor.use();
    await db
      .update(chats)
      .set(input)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));
  }

  export async function del(id: string) {
    const { userId } = Actor.use();
    await db
      .delete(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, userId)));
  }
}
