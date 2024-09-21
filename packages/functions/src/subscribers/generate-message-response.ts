import type { SQSHandler } from "aws-lambda";
import { z } from "zod";

import { Actor } from "@project-4/core/actor";
import { AI } from "@project-4/core/ai/index";
import { Chat } from "@project-4/core/chat/index";
import { createPool } from "@project-4/core/db/pool";
import { APIError } from "@project-4/core/error";
import { Message } from "@project-4/core/messages/index";

export const handler: SQSHandler = async (event) => {
  const results = await createPool(
    async () =>
      await Promise.all(
        event.Records.map(async ({ messageId, body }) => {
          try {
            const { actor, message } =
              Message.Event.generateResponse.input.parse(JSON.parse(body));
            await handleGenerateMessageResponse({ actor, message });
            return { type: "success", messageId } as const;
          } catch (error) {
            return {
              type: "error",
              error,
              messageId,
              retry: error instanceof APIError ? error.retry : true,
            } as const;
          }
        }),
      ),
  );
  return {
    batchItemFailures: results
      .filter((result) => result.type === "error" && result.retry)
      .map((result) => ({
        itemIdentifier: result.messageId,
      })),
  };
};

const handleGenerateMessageResponse = async ({
  actor,
  message,
}: z.infer<typeof Message.Event.generateResponse.input>) => {
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
    if (!messages.some((message) => message.id === message.id)) {
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
