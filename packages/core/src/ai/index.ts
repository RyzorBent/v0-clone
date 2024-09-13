import OpenAI from "openai";
import { Resource } from "sst";
import { Chat, Message } from "../db/schema";
import { MessagesAPI } from "../messages";
import { RealtimeAPI } from "../realtime";
import { ChatAPI } from "../chat";

export namespace AI {
  const openai = new OpenAI({
    apiKey: Resource.OPENAI_API_KEY.value,
  });

  export async function generateChatTitle(chatId: string, messages: Message[]) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Based on the following messages, return a brief title for the chat. Do not include any content in your response besides the title.
          
          Here are the messages:
          ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}`,
        },
      ],
      stream: true,
    });

    let title = "";
    for await (const chunk of completion) {
      title += chunk.choices[0].delta.content ?? "";
      await RealtimeAPI.onTitleChanged(chatId, title);
    }
    await ChatAPI.update(chatId, null, { title });
  }

  export async function generateMessageResponse(
    chat: Chat & { messages: Message[] }
  ) {
    const message = await MessagesAPI.create({
      chatId: chat.id,
      role: "assistant",
      content: "",
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chat.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream: true,
    });
    for await (const chunk of completion) {
      message.content += chunk.choices[0].delta.content ?? "";
      await RealtimeAPI.onMessageChanged(message);
    }
    await MessagesAPI.update(message.id, { content: message.content });
  }
}
