import { ChatAPI } from "@project-4/core/chat";
import { RealtimeAPI } from "@project-4/core/realtime";
import { Context } from "aws-lambda";
import { z } from "zod";

const schema = z.object({
  topic: z.string(),
  count: z.number(),
});

export const handler = async (event: unknown, context: Context) => {
  const parsedEvent = schema.safeParse(event);
  if (!parsedEvent.success) {
    return;
  }
  const { topic, count } = parsedEvent.data;
  const chatId = topic.split("/").pop();
  if (!chatId) {
    return;
  }
  const chat = await ChatAPI.get(chatId);
  if (!chat) {
    return;
  }
  if (count < chat.messages.length) {
    for (let i = count; i < chat.messages.length; i++) {
      console.log("publishing", chat.messages[i]);
      await RealtimeAPI.onMessageChanged(chat.messages[i]);
    }
  }
};
