import { AI } from "@project-4/core/ai";
import { ChatAPI } from "@project-4/core/chat";
import { QueueAPI } from "@project-4/core/queue";
import type { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  const { message } = QueueAPI.GenerateMessageResponseInput.parse(
    JSON.parse(event.Records[0].body)
  );
  const chat = await ChatAPI.get(message.chatId);
  if (!chat) {
    return;
  }
  if (!chat.messages.some((message) => message.id === message.id)) {
    chat.messages.push(message);
  }
  await AI.generateMessageResponse(chat);
  if (!chat.title) {
    await QueueAPI.enqueue({
      type: "GenerateChatTitleQueue",
      body: { chatId: chat.id },
    });
  }
  return {
    statusCode: 200,
    body: "Success",
  };
};
