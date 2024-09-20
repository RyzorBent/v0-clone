import { nanoid } from "nanoid";
import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import { Resource } from "sst";
import { z } from "zod";

import { Chat } from "../chat";
import { Message } from "../messages";
import { Realtime } from "../realtime";
import knowledgeBase from "./knowledge-base.json";
import * as Prompt from "./prompt";

export namespace AI {
  const openai = new OpenAI({
    apiKey: Resource.OpenAIAPIKey.value,
  });

  export async function generateChatTitle(chatId: string, messages: Message[]) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: Prompt.generateTitle(messages),
        },
      ],
      stream: true,
    });

    let title = "";
    for await (const chunk of completion) {
      title += chunk.choices[0].delta.content ?? "";
      await Realtime.onTitleChanged(chatId, title);
    }
    await Chat.patch(chatId, { title });
  }

  export async function generateMessageResponse(
    chatId: string,
    messages: Message[],
  ) {
    const completion = await generateChatCompletion([
      {
        role: "system",
        content: Prompt.generateReply,
      },
      ...messages.map(toChatCompletionMessage),
    ]);

    const responseMessages: Message[] = [];

    return await completion.pipeTo(
      new WritableStream({
        write: async (chunk) => {
          const index = responseMessages.length - 1;

          if (
            index >= 0 &&
            chunk.message.role === responseMessages[index].role
          ) {
            Object.assign(responseMessages[index], chunk.message);
            if (chunk.type === "save") {
              await Message.patch(responseMessages[index]);
            } else {
              await Realtime.onMessageChanged(responseMessages[index]);
            }
          } else {
            const message = await Message.create({
              id: nanoid(),
              chatId,
              role: chunk.message.role,
              content: chunk.message.content,
              toolCalls: chunk.message.toolCalls,
              toolCallId: chunk.message.toolCallId,
            });
            responseMessages.push(message);
          }
        },
      }),
    );
  }

  async function generateChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ) {
    const completion = openai.beta.chat.completions.runTools({
      model: "gpt-4o-mini",
      messages,
      tools: [
        zodFunction({
          name: "get-component-info",
          description:
            "Use this to retrieve documentation and examples for the components you intend to use.",
          parameters: z.object({
            components: z.array(z.string()),
          }),
          function: getComponentFromKnowledgeBase,
        }),
      ],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    });
    await new Promise<void>((resolve, reject) => {
      completion.once("connect", () => {
        resolve();
        completion.off("error", reject);
      });
      completion.once("error", reject);
    });
    return new ReadableStream<
      | {
          type: "partial";
          message: Pick<
            Message,
            "role" | "content" | "toolCalls" | "toolCallId"
          >;
        }
      | {
          type: "save";
          message: Pick<
            Message,
            "role" | "content" | "toolCalls" | "toolCallId"
          >;
        }
    >({
      start(controller) {
        completion.on("content", (_, snapshot) => {
          controller.enqueue({
            type: "partial",
            message: {
              role: "assistant",
              content: snapshot,
              toolCalls: null,
              toolCallId: null,
            },
          });
        });
        completion.on("message", (message) => {
          controller.enqueue({
            type: "save",
            message: {
              role: message.role as "user" | "assistant" | "tool",
              content:
                typeof message.content === "string" ? message.content : null,
              toolCalls:
                "tool_calls" in message &&
                message.tool_calls &&
                message.tool_calls.length > 0
                  ? message.tool_calls
                  : null,
              toolCallId:
                "tool_call_id" in message ? message.tool_call_id : null,
            },
          });
        });
        completion.on("end", () => {
          controller.close();
        });
        completion.on("error", (error) => {
          controller.error(error);
        });
      },
    });
  }

  function toChatCompletionMessage(
    message: Message,
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam {
    return {
      role: message.role,
      content: message.content,
      tool_call_id: message.toolCallId,
      tool_calls: message.toolCalls,
    } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
  }

  function getComponentFromKnowledgeBase(input: { components: string[] }) {
    return input.components.map((component) => {
      if (component in knowledgeBase) {
        return knowledgeBase[component as keyof typeof knowledgeBase];
      }
      return {
        title: component,
        description:
          "This is not a valid component. Do not attempt to use this component.",
      };
    });
  }
}
