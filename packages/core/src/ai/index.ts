import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import { Resource } from "sst";
import { z } from "zod";
import { Chat } from "../chat";
import { Message } from "../messages";
import { Realtime } from "../realtime";
import context from "./knowledge-base.json";

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
          content: `Generate a concise title for this chat, focusing on the main topic or specific code components being discussed or generated. The title should be as short as possible while still being descriptive. If code is being generated, prioritize mentioning the type of component or functionality. Only return the title itself, with no additional text.

          Chat messages:
          ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}`,
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
    messages: Message[]
  ) {
    const completion = generateResponseInternal(
      messages.map(
        (message) =>
          ({
            role: message.role,
            content: message.content,
            tool_call_id: message.toolCallId,
            tool_calls: message.toolCalls,
          }) as OpenAI.Chat.Completions.ChatCompletionMessageParam
      )
    );
    let responseMessage = await Message.create({
      chatId,
      role: "assistant",
    });
    while (true) {
      try {
        const { value, done } = await completion.next();
        if (done) {
          await Message.patch(responseMessage.id, {
            content: value.content as string | null,
            toolCalls: value.tool_calls,
          });
          return value;
        }
        switch (value.type) {
          case "content": {
            responseMessage.content ??= "";
            responseMessage.content += value.content;
            await Realtime.onMessageChanged(responseMessage);
            break;
          }
          case "messages": {
            for (const message of value.messages) {
              if (message.role === "assistant") {
                await Message.patch(responseMessage.id, {
                  content: message.content as string | null,
                  toolCalls: message.tool_calls,
                });
                responseMessage = await Message.create({
                  chatId,
                  role: "assistant",
                });
              } else {
                await Message.create({
                  chatId,
                  role: message.role,
                  content: message.content,
                  toolCallId: message.tool_call_id,
                });
              }
            }
            break;
          }
        }
      } catch (error) {
        await Message.del(responseMessage.id);
        throw error;
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
          yield {
            type: "messages" as const,
            messages: [value, ...toolCalls],
          };
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
            "16. Do not include backticks, triple backticks, or any other code block indicators around the code inside the Artifact tags. The code should be directly inside the Artifact tags without any additional formatting.",
            "17. Ensure that the Artifact tags are on separate lines from the code content.",
            "Example:",
            '<Artifact title="Button Component" identifier="button-component" type="tsx">',
            "import React from 'react';",
            "import { Button } from '~/components/ui/button';",
            "",
            "export default function CustomButton() {",
            "  return <Button>Click me</Button>;",
            "}",
            "</Artifact>",
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

  function handleGetComponentInfo(input: { components: string[] }) {
    return input.components.map((component) => {
      if (component in context) {
        return context[component as keyof typeof context];
      }
      return {
        title: component,
        description:
          "This is not a valid component. Do not attempt to use this component.",
      };
    });
  }
}
