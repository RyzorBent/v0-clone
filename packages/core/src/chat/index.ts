import { nanoid } from "nanoid";
import { db } from "../db";
import { Chat, Message } from "../db/schema";

export namespace ChatAPI {
  export async function create(userId: string, messageContent: string) {
    return await db.transaction(async (tx) => {
      const chatId = nanoid();
      await tx.insert(Chat).values({
        id: chatId,
        userId,
      });
      await tx.insert(Message).values({
        id: nanoid(),
        chatId,
        content: messageContent,
      });
      return chatId;
    });
  }

  export async function findById(id: string) {
    return await db.query.Chat.findFirst({
      where: (Chat, { eq }) => eq(Chat.id, id),
      with: {
        messages: true,
      },
    });
  }
}
