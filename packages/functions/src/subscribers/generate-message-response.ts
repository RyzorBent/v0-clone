import { Actor } from "@project-4/core/actor";
import { AI } from "@project-4/core/ai/index";
import { Chat } from "@project-4/core/chat/index";
import { Message } from "@project-4/core/messages/index";
import type { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  await Promise.all(
    event.Records.map(async ({ body }) => {
      const { userId, message } = Message.Event.generateResponse.input.parse(
        JSON.parse(body)
      );
      await Actor.with(userId, async () => {
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
    })
  );
  return {
    statusCode: 200,
    body: "Success",
  };
};
