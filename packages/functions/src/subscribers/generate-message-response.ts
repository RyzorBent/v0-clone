import type { SQSHandler } from "aws-lambda";
import { z } from "zod";

import { Actor } from "@project-4-v0/core/actor";
import { AI } from "@project-4-v0/core/ai";
import { Chat } from "@project-4-v0/core/chat";
import { createPool } from "@project-4-v0/core/db/pool";
import { APIError } from "@project-4-v0/core/error";
import { Message } from "@project-4-v0/core/messages";

export const handler: SQSHandler = async (event) => {
  type Result = 
    | { type: "success"; messageId: string }
    | { type: "error"; error: unknown; messageId: string; retry: boolean };
  
  const results = await createPool<Result[]>(
    async () =>
      await Promise.all(
        event.Records.map(async ({ messageId, body }) => {
          try {
            const result = JSON.parse(body);
            const actor = result.actor;
            const message = result.message as { id: string; chatId: string };
            await handleGenerateMessageResponse({ actor, message });
            return { type: "success", messageId } as const;
          } catch (error) {
            const isAPIError = (e: unknown): e is APIError => e instanceof APIError;
            return {
              type: "error",
              error,
              messageId,
              retry: isAPIError(error) ? error.retry : true,
            } as const;
          }
        }),
      ),
  );
  return {
    batchItemFailures: results
      .filter((result: Result): result is Extract<Result, { type: "error" }> => 
        result.type === "error" && result.retry)
      .map((result: Extract<Result, { type: "error" }>) => ({
        itemIdentifier: result.messageId,
      })),
  };
};

const handleGenerateMessageResponse = async ({
  actor,
  message,
}: { actor: { type: "user"; userId: string }; message: { id: string; chatId: string } }) => {
  if (actor.type !== "user") {
    throw APIError.unauthorized(
      "Cannot generate message response for non-user actor",
    );
  }
  await Actor.with(actor, async () => {
    const [chat, messages] = await Promise.all([
      Chat.get(message.chatId),
      Message.list(message.chatId),
    ]);
    if (!chat) {
      return;
    }
    // Add message to messages array if not already present
    if (!messages.some((msg: { id: string }) => msg.id === message.id)) {
      messages.push(message);
    }
    await Promise.all([
      AI.generateMessageResponse(message.chatId, messages),
      chat.title
        ? Promise.resolve()
        : AI.generateChatTitle(message.chatId, messages),
    ]);
  });
};
