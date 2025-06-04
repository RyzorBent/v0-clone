import OpenAI from "openai";
import { Resource } from "sst";

import { Chat } from "../chat/index.js";
import { Message } from "../messages/index.js";
import { Realtime } from "../realtime.js";
import { ComponentContext, retrieveComponentContext } from "./context.js";
import { Prompt } from "./prompt.js";
import {
  ComponentFunction,
  refineQuery,
  RefineQueryOutputChunk,
  ToolCall,
} from "./refine-query.js";

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
    const refinedQuery = await handleRefineQuery(chatId, messages);

    if (!refinedQuery) {
      return;
    }

    const [completion] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: Prompt.generateComponent({
              query: refinedQuery.query,
              componentsContext: refinedQuery.context.components
                .map(
                  (c) =>
                    `<component relevance="${c.score}">${c.content}</component>`,
                )
                .join("\n"),
              blocksContext: refinedQuery.context.blocks
                .map(
                  (b) => `<block relevance="${b.score}">${b.content}</block>`,
                )
                .join("\n"),
            }),
          },
        ],
        stream: true,
      }),
      Message.patch({
        ...refinedQuery.message,
        metadata: {
          status: "generating-component",
        },
      }),
    ]);
    const iterator = completion[Symbol.asyncIterator]();
    const readable = new ReadableStream<string>({
      pull: async (controller) => {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          if (value.choices[0].delta.content) {
            controller.enqueue(value.choices[0].delta.content);
          }
        }
      },
    });

    let responseMessage: Message;
    let lastSentAt = 0;
    const times: { time: number; delay: number; sent: boolean }[] = [];
    const writable = new WritableStream<string>({
      start: async () => {
        responseMessage = await Message.create({
          chatId,
          role: "assistant",
          content: "",
          context: refinedQuery.context,
        });
      },
      write: async (content) => {
        responseMessage.content += content;

        const now = Date.now();
        const randomDelay = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

        if (now - lastSentAt > randomDelay) {
          times.push({
            time: now - lastSentAt,
            delay: randomDelay,
            sent: true,
          });
          lastSentAt = now;
          await Realtime.onMessageChanged(responseMessage);
        } else {
          times.push({
            time: now - lastSentAt,
            delay: randomDelay,
            sent: false,
          });
        }
      },
      close: async () => {
        await Message.patch(responseMessage);
        console.log({
          sent: times.filter((t) => t.sent).length,
          skipped: times.filter((t) => !t.sent).length,
          averageDelay:
            times.reduce((acc, t) => acc + t.delay, 0) / times.length,
        });
      },
    });
    await readable.pipeTo(writable);
  }

  export async function handleRefineQuery(
    chatId: string,
    messages: Message[],
  ): Promise<{
    query: string;
    context: ComponentContext;
    message: Message;
  } | null> {
    const [result, message] = await Promise.all([
      refineQuery(messages),
      Message.create({
        chatId,
        role: "assistant",
        metadata: {
          status: "thinking",
        },
      }),
    ]);

    let partialComponentQuery: ToolCall<ComponentFunction> | null = null;
    let completedComponentQuery: {
      query: string;
      context: ComponentContext;
      message: Message;
    } | null = null;

    await result
      .pipeThrough(
        new TransformStream<RefineQueryOutputChunk, Message>({
          async transform(chunk, controller) {
            switch (chunk.function.name) {
              case "reply":
                message.content = chunk.function.parsedArguments.message;
                if (message.content) {
                  message.metadata = null;
                }
                break;
              case "refine-component-query":
                partialComponentQuery = chunk as ToolCall<ComponentFunction>;
                message.toolCalls = [partialComponentQuery];
                message.metadata = {
                  status: "planning",
                };
                break;
            }
            controller.enqueue(message);
          },
        }),
      )
      .pipeTo(
        new WritableStream({
          write: async (message) => {
            await Realtime.onMessageChanged(message);
          },
          close: async () => {
            if (partialComponentQuery) {
              const [context] = await Promise.all([
                retrieveComponentContext(
                  partialComponentQuery.function.parsedArguments.refinedQuery,
                ),
                Message.patch({
                  ...message,
                  toolCalls: [partialComponentQuery],
                  metadata: {
                    status: "retrieving-context",
                  },
                }),
              ]);
              completedComponentQuery = {
                query:
                  partialComponentQuery.function.parsedArguments.refinedQuery,
                context,
                message,
              };
            } else {
              await Message.patch(message);
            }
          },
        }),
      );
    return completedComponentQuery;
  }
}
