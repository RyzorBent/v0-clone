import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { z } from "zod";

import { Actor } from "../actor";
import { chats } from "../chat/chat.sql";
import { withTransaction } from "../db/transaction";
import { NonRetryableError } from "../error";
import { Realtime } from "../realtime";
import { messages } from "./message.sql";

export type Message = typeof messages.$inferSelect;

export namespace Message {
  const sqs = new SQSClient({});

  export const Insert = createInsertSchema(messages, {
    createdAt: z.coerce.date(),
    toolCalls: z.array(z.unknown()).nullish(),
  });
  export type Insert = z.infer<typeof Insert>;

  export const Event = {
    generateResponse: {
      input: z.object({
        actor: z.object({ type: z.literal("user"), userId: z.string() }),
        message: createSelectSchema(messages, {
          createdAt: z.coerce.date(),
          toolCalls: z.array(z.unknown()).nullable(),
        }),
      }),
    },
  };

  export async function list(chatId: string) {
    return await withTransaction(async (tx) => {
      const [rows] = await Promise.all([
        tx.select().from(messages).where(eq(messages.chatId, chatId)),
        authorizeRead(chatId),
      ]);
      return rows;
    });
  }

  export async function create(input: z.infer<typeof Insert>) {
    const message: Message = {
      id: input.id ?? nanoid(),
      chatId: input.chatId,
      role: input.role,
      content: input.content ?? null,
      toolCallId: input.toolCallId ?? null,
      toolCalls: input.toolCalls ?? null,
      createdAt: input.createdAt ?? new Date(),
    };
    await withTransaction(
      async (tx) =>
        await Promise.all([
          tx.insert(messages).values(message),
          authorizeWrite(input.chatId),
        ]),
    );
    await Promise.all([
      Realtime.onMessageChanged(message),
      message.role === "user"
        ? sqs.send(
            new SendMessageCommand({
              QueueUrl: Resource.GenerateMessageResponseQueue.url,
              MessageBody: JSON.stringify({ actor: Actor.useUser(), message }),
            }),
          )
        : Promise.resolve(),
    ]);
    return message;
  }

  export async function patch(message: Message) {
    await withTransaction(async (tx) => {
      await Promise.all([
        tx.update(messages).set(message).where(eq(messages.id, message.id)),
        authorizeWrite(message.chatId),
      ]);
    });
    await Realtime.onMessageChanged(message);
  }

  export async function del(id: string) {
    await withTransaction(async (tx) => {
      const [message] = await tx
        .delete(messages)
        .where(eq(messages.id, id))
        .returning();
      if (!message) {
        return;
      }
      await authorizeWrite(message.chatId);
    });
  }

  async function authorizeRead(chatId: string) {
    return await withTransaction(async (tx) => {
      const actor = Actor.use();
      const chat = await tx.query.chats.findFirst({
        columns: { id: true, public: true, userId: true },
        where: eq(chats.id, chatId),
      });
      if (!chat) {
        throw new NonRetryableError("Chat not found");
      }
      if (actor.type === "public") {
        if (!chat.public) {
          throw new NonRetryableError("Chat is not public");
        }
      } else {
        if (chat.userId !== actor.userId) {
          throw new NonRetryableError(
            `User ${actor.userId} cannot read chat ${chatId}`,
          );
        }
      }
      return true;
    });
  }
  async function authorizeWrite(chatId: string) {
    return await withTransaction(async (tx) => {
      const actor = Actor.useUser();
      const chat = await tx.query.chats.findFirst({
        columns: { id: true, userId: true },
        where: eq(chats.id, chatId),
      });
      if (!chat) {
        throw new NonRetryableError("Chat not found");
      }
      if (chat.userId !== actor.userId) {
        throw new NonRetryableError(
          `User ${actor.userId} cannot write to chat ${chatId}`,
        );
      }
      return true;
    });
  }
}
