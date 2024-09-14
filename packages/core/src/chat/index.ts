import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "../db";
import { Chat, ChatInsert } from "./chat.sql";

export namespace ChatAPI {
  export const UpdateInput = z.object({
    title: z.string().optional(),
  });

  export async function index(userId: string) {
    const chats = await db.select().from(Chat).where(eq(Chat.userId, userId));
    return chats;
  }

  export async function get(chatId: string, userId: string | null = null) {
    const chat = await db.query.Chat.findFirst({
      where: and(
        eq(Chat.id, chatId),
        userId ? eq(Chat.userId, userId) : undefined
      ),
      with: {
        messages: true,
      },
    });
    return chat;
  }

  export async function create(userId: string) {
    const chat: ChatInsert = {
      id: nanoid(),
      userId,
    };
    await db.insert(Chat).values(chat);
    return chat;
  }

  export async function update(
    chatId: string,
    userId: string | null,
    input: z.infer<typeof UpdateInput>
  ) {
    await db
      .update(Chat)
      .set(input)
      .where(
        and(eq(Chat.id, chatId), userId ? eq(Chat.userId, userId) : undefined)
      );
  }

  export async function del(id: string, userId: string) {
    await db.delete(Chat).where(and(eq(Chat.id, id), eq(Chat.userId, userId)));
  }
}
