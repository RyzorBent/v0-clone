import { AI } from "@project-4/core/ai";
import { ChatAPI } from "@project-4/core/chat";
import { QueueAPI } from "@project-4/core/queue";
import type { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  const { chatId } = QueueAPI.GenerateChatTitleInput.parse(
    JSON.parse(event.Records[0].body)
  );
  const chat = await ChatAPI.get(chatId);
  if (!chat || chat.title) {
    return;
  }
  await AI.generateChatTitle(chatId, chat.messages);
  return {
    statusCode: 200,
    body: "Success",
  };
};
