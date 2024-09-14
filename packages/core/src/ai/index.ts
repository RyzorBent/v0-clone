import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import { Resource } from "sst";
import { z } from "zod";
import { ChatAPI } from "../chat";
import { Chat } from "../chat/chat.sql";
import { MessagesAPI } from "../messages";
import { Message } from "../messages/message.sql";
import { RealtimeAPI } from "../realtime";
import context from "./knowledge-base.json";

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
    let responseMessage = await MessagesAPI.create({
      chatId: chat.id,
      role: "assistant",
    });
    const completion = generateResponseInternal(
      chat.messages.map(
        (message) =>
          ({
            role: message.role,
            content: message.content,
            tool_call_id: message.toolCallId,
            tool_calls: message.toolCalls,
          }) as OpenAI.Chat.Completions.ChatCompletionMessageParam
      )
    );
    while (true) {
      const { value, done } = await completion.next();
      if (done) {
        await MessagesAPI.update(responseMessage.id, {
          content: value.content as string | null,
          toolCalls: value.tool_calls,
        });
        return value;
      }
      if (value.type === "content") {
        responseMessage.content ??= "";
        responseMessage.content += value.content;
        await RealtimeAPI.onMessageChanged(responseMessage);
      } else if (value.type === "message") {
        if (value.message.role === "assistant") {
          await MessagesAPI.update(responseMessage.id, {
            content: value.message.content as string | null,
            toolCalls: value.message.tool_calls,
          });
          responseMessage = await MessagesAPI.create({
            chatId: chat.id,
            role: "assistant",
          });
        } else if (value.message.role === "tool") {
          await MessagesAPI.create({
            chatId: chat.id,
            role: "tool",
            content: value.message.content,
            toolCallId: value.message.tool_call_id,
          });
        }
      }
    }
  }

  export async function* generateResponseInternal(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    const response = generateChatCompletion(messages);
    while (true) {
      const { value, done } = await response.next();
      if (done) {
        if (value.tool_calls) {
          yield {
            type: "message" as const,
            message: value,
          };
          const toolCalls = value.tool_calls.map((tool_call) => {
            const args = JSON.parse(tool_call.function.arguments) as {
              components: (keyof typeof context)[];
            };
            return {
              role: "tool",
              tool_call_id: tool_call.id,
              content: JSON.stringify(handleGetComponentInfo(args)),
            } satisfies OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
          });
          for (const toolCall of toolCalls) {
            yield {
              type: "message" as const,
              message: toolCall,
            };
          }
          return yield* generateChatCompletion([
            ...messages,
            value,
            ...toolCalls,
          ]);
        }
        return value;
      }
      yield value;
    }
  }

  function handleGetComponentInfo(input: { components: string[] }) {
    return (input.components as (keyof typeof context)[]).map(
      (component) =>
        context[component] as {
          title: string;
          description: string;
          documentation: string;
        }
    );
  }

  async function* generateChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "You are an expert frontend React engineer and UI/UX designer. Your task is to generate a React component based on the user's request.",
            "Instructions:",
            "1. Begin with a brief acknowledgement of the user's request.",
            "2. Create a React component that fulfills the user's requirements.",
            "3. Ensure the component has a default export and no required props.",
            "4. Use TypeScript and make the component interactive with state when necessary.",
            "5. Style the component using Tailwind CSS classes.",
            "6. Before using any prebuilt component, use the `get-component-info` function to retrieve its documentation and examples.",
            "7. You have access to the following prebuilt components:",
            ...Object.values(context).map(
              (doc) => `   - ${doc.title}: ${doc.description}`
            ),
            "8. After retrieving component information, incorporate it into your solution appropriately.",
            "9. Provide a complete, well-formatted React component code, including necessary imports.",
            "10. Do not use any libraries or components other than those listed above.",
            "11. Ensure your code is functional, well-structured, and follows best practices.",
            "12. After the component code, provide a brief explanation of how the component works and any key features or decisions made in its implementation.",
            "13. Wrap the generated code in <Artifact> tags.",
            "14. Include a title, identifier, and type in the opening <Artifact> tag.",
            "15. To update the code, recreate the artifact using the same identifier.",
            "16. Do not include backticks (`) or any other code block indicators around the code inside the Artifact tags.",
            "Example:",
            '<Artifact title="Button Component" identifier="button-component" type="tsx">',
            "import React from 'react';",
            "import { Button } from '~/components/ui/button';",
            "",
            "export default function CustomButton() {",
            "  return <Button>Click me</Button>;",
            "}",
            "</Artifact>",
            "17. Your code will run in a Vite/React app. Do not include any code that is not supported in this environment.",
          ].join("\n"),
        },
        ...messages,
      ],
      tools: [
        zodFunction({
          name: "get-component-info",
          description:
            "Use this to retrieve documentation and examples for the components you intend to use.",
          parameters: z.object({
            components: z.array(z.string()),
          }),
          function: handleGetComponentInfo,
        }),
      ],
      stream: true,
    });

    const response: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam =
      {
        role: "assistant",
        content: null,
        refusal: null,
      };
    for await (const chunk of completion) {
      if (chunk.choices[0].delta.content) {
        response.content ??= "";
        response.content += chunk.choices[0].delta.content;
        yield {
          type: "content" as const,
          content: chunk.choices[0].delta.content,
        };
      }
      if (chunk.choices[0].delta.tool_calls?.[0]) {
        if (!response.tool_calls) {
          response.tool_calls = [];
          yield {
            type: "tool-call" as const,
            name: chunk.choices[0].delta.tool_calls[0].function?.name,
          };
        }
        const content = chunk.choices[0].delta.tool_calls[0];
        if (content.index >= response.tool_calls.length) {
          response.tool_calls.push(
            content as OpenAI.Chat.Completions.ChatCompletionMessageToolCall
          );
        } else {
          response.tool_calls[content.index].function.arguments +=
            content.function?.arguments ?? "";
        }
      }
      if (chunk.choices[0].delta.refusal) {
        response.refusal = chunk.choices[0].delta.refusal;
      }
    }

    return response;
  }

  export function extractArtifacts(content: string): {
    content: string;
    artifacts: Array<{
      title: string;
      identifier: string;
      content: string;
    }>;
  } {
    const artifacts: Array<{
      title: string;
      identifier: string;
      content: string;
    }> = [];
    const regex =
      /<Artifact\s+title="([^"]+)"\s+identifier="([^"]+)">([\s\S]*?)(?:<\/Artifact>|$)/g;

    const cleanedContent = content.replace(
      regex,
      (match, title, identifier, artifactContent) => {
        artifacts.push({
          title,
          identifier,
          content: artifactContent.trim(),
        });
        return `<Artifact title="${title}" identifier="${identifier}" />`;
      }
    );

    return {
      content: cleanedContent,
      artifacts,
    };
  }
}
