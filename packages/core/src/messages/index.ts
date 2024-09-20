import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { asc, eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Resource } from "sst";
import { z } from "zod";
import { Actor } from "../actor";
import { db } from "../db";
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
        userId: z.string(),
        message: createSelectSchema(messages, {
          createdAt: z.coerce.date(),
          toolCalls: z.array(z.unknown()).nullable(),
        }),
      }),
    },
  };

  export async function list(chatId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));
  }

  export async function create(input: z.infer<typeof Insert>) {
    const { userId } = Actor.use();
    const [message] = await db.insert(messages).values(input).returning();
    await Promise.all([
      Realtime.onMessageChanged(message),
      message.role === "user"
        ? sqs.send(
            new SendMessageCommand({
              QueueUrl: Resource.GenerateMessageResponseQueue.url,
              MessageBody: JSON.stringify({ userId, message }),
            })
          )
        : Promise.resolve(),
    ]);
    return message;
  }

  export async function patch(
    id: string,
    input: { content: string | null; toolCalls?: unknown[] | null }
  ) {
    const [message] = await db
      .update(messages)
      .set(input)
      .where(eq(messages.id, id))
      .returning();
    await Realtime.onMessageChanged(message);
  }

  export async function del(id: string) {
    await db.delete(messages).where(eq(messages.id, id));
  }
}
