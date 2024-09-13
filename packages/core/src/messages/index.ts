import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { Message } from "../db/schema";
import { QueueAPI } from "../queue";
import { RealtimeAPI } from "../realtime";

export namespace MessagesAPI {
  export async function list(chatId: string) {
    return await db
      .select()
      .from(Message)
      .where(eq(Message.chatId, chatId))
      .orderBy(asc(Message.createdAt));
  }

  export async function create(input: Omit<Message, "id" | "createdAt">) {
    const message: Message = {
      id: nanoid(),
      chatId: input.chatId,
      role: input.role,
      content: input.content,
      createdAt: new Date(),
    };
    await Promise.all([
      db.insert(Message).values(message),
      RealtimeAPI.onMessageChanged(message),
      message.role === "user"
        ? QueueAPI.enqueue({
            type: "GenerateMessageResponseQueue",
            body: { message },
          })
        : Promise.resolve(),
    ]);
    return message;
  }

  export async function update(id: string, input: { content: string }) {
    const [message] = await db
      .update(Message)
      .set(input)
      .where(eq(Message.id, id))
      .returning();
    await RealtimeAPI.onMessageChanged(message);
  }
}
