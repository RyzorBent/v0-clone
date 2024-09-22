import { nanoid } from "nanoid";
import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import { Resource } from "sst";
import { z } from "zod";

import { Chat } from "../chat";
import { Message } from "../messages";
import { Realtime } from "../realtime";
import blocks from "./blocks.json";
import components from "./components.json";
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
          name: "plan-component-generation",
          description:
            "Before generating a component, please explain how you intend to implement the user's request. If you name a block or any components, the system will include them in the generation context for your reference.",
          parameters: z.object({
            reasoning: z
              .string()
              .describe(
                "Think from a design and implementation perspective about what the user wants to build and how you can implement it.",
              ),
            block: z
              .string()
              .optional()
              .describe(
                "If the user's request is similar to one of the given blocks, please provide the name of the block.",
              ),
            components: z
              .array(z.string())
              .describe(
                "If you plan to use shadcn/ui components, list them here.",
              ),
            description: z
              .string()
              .describe(
                "Describe how you plan to implement the user's request.",
              ),
          }),
          function: getShadcnContext,
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

  function getShadcnContext(input: { components: string[]; block?: string }) {
    const componentDocumentation = components
      .filter((component) => input.components.includes(component.name))
      .map(
        (component) =>
          `<Component name="${component.name}">\n${component.examples
            .slice(0, 1)
            .map(
              (example) =>
                `<Example name="${example.name}" description="${example.description}">\n${example.content}\n</Example>`,
            )
            .join(", ")}\n</Component>`,
      );
    const blockDocumentation = blocks
      .filter((block) => block.name === input.block)
      .map(
        (block) =>
          `<Block name="${block.name}" description="${block.description}">\n${block.content}\n</Block>`,
      );

    if (
      componentDocumentation.length === 0 &&
      blockDocumentation.length === 0
    ) {
      return "No component or block documentation found.";
    }

    let response = "";
    if (componentDocumentation.length > 0) {
      response += `Components:\n${componentDocumentation.join("\n")}`;
    }
    if (blockDocumentation.length > 0) {
      response += `\n\nBlock:\n${blockDocumentation[0]}`;
    }
    return response;
  }
}
