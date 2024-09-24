import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { z } from "zod";

import { Actor } from "../actor";
import { Chat } from "../chat";
import { withTransaction } from "../db/transaction";
import { APIError } from "../error";
import { Realtime } from "../realtime";
import { messages } from "./message.sql";

export type Message = typeof messages.$inferSelect;

export namespace Message {
  const sqs = new SQSClient({});

  export const Insert = createInsertSchema(messages, {
    metadata: z
      .object({
        status: z.enum([
          "thinking",
          "planning",
          "retrieving-context",
          "generating-component",
        ]),
      })
      .nullish(),
    context: z
      .object({
        components: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            score: z.number().optional(),
          }),
        ),
        blocks: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            score: z.number().optional(),
          }),
        ),
      })
      .nullish(),
    createdAt: z.coerce.date(),
    toolCalls: z.array(z.unknown()).nullish(),
  });
  export type Insert = z.infer<typeof Insert>;

  export const Event = {
    generateResponse: {
      input: z.object({
        actor: z.object({ type: z.literal("user"), userId: z.string() }),
        message: createSelectSchema(messages, {
          context: z.null(),
          metadata: z.null(),
          createdAt: z.coerce.date(),
          toolCalls: z.array(z.unknown()).nullable(),
        }),
      }),
    },
  };

  export async function list(chatId: string) {
    return await withTransaction(async (tx) => {
      const [messages] = await Promise.all([
        tx.query.messages.findMany({
          columns: {
            context: false,
          },
          where: (messages, { eq }) => eq(messages.chatId, chatId),
          orderBy: (messages, { asc }) => asc(messages.createdAt),
        }),
        authorizeRead(chatId),
      ]);
      return messages;
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
      context: input.context ?? null,
      metadata: input.metadata ?? null,
    };
    await withTransaction(
      async (tx) =>
        await Promise.all([
          tx.insert(messages).values(message),
          Chat.touch(input.chatId),
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
        Chat.touch(message.chatId),
      ]);
    });
    await Realtime.onMessageChanged(message);
  }

  export async function del(id: string) {
    await withTransaction(async (tx) => {
      const [message] = await tx
        .delete(messages)
        .where(eq(messages.id, id))
        .returning({ chatId: messages.chatId });
      if (!message) {
        return;
      }
      await Chat.touch(message.chatId);
    });
  }

  async function authorizeRead(chatId: string) {
    return await withTransaction(async (tx) => {
      const actor = Actor.use();
      const chat = await tx.query.chats.findFirst({
        columns: { id: true, public: true, userId: true },
        where: (chats, { eq }) => eq(chats.id, chatId),
      });
      if (!chat) {
        throw APIError.notFound("Chat not found");
      }
      if (actor.type === "public") {
        if (!chat.public) {
          throw APIError.unauthorized("Chat is not public");
        }
      } else {
        if (chat.userId !== actor.userId) {
          throw APIError.unauthorized(
            `User ${actor.userId} cannot read chat ${chatId}`,
          );
        }
      }
      return true;
    });
  }
}
