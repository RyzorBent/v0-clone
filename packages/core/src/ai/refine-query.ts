import { OpenAI } from "openai";
import { zodFunction } from "openai/helpers/zod";
import { Stream } from "openai/streaming";
import { parse } from "partial-json";
import { Resource } from "sst";
import { z } from "zod";

import { Message } from "../messages";
import { Prompt } from "./prompt";

const openai = new OpenAI({
  apiKey: Resource.OpenAIAPIKey.value,
});

interface ToolCallFunction<T extends string, U> {
  name: T;
  arguments: string;
  parsedArguments: U;
}

export interface ToolCall<
  Function extends ToolCallFunction<string, Record<string, unknown>>,
> extends OpenAI.ChatCompletionMessageToolCall {
  id: string;
  type: "function";
  function: Function;
}

export type ReplyFunction = ToolCallFunction<"reply", { message: string }>;
export type ComponentFunction = ToolCallFunction<
  "refine-component-query",
  { refinedQuery: string }
>;

export type RefineQueryOutputChunk = ToolCall<
  ReplyFunction | ComponentFunction
>;

export async function refineQuery(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: Prompt.refineQuery(messages),
      },
    ],
    tools: [
      zodFunction({
        name: "reply",
        parameters: z.object({
          message: z
            .string()
            .describe("A conversational response to the user's message."),
        }),
      }),
      zodFunction({
        name: "refine-component-query",
        parameters: z.object({
          refinedQuery: z
            .string()
            .describe("A refined query for the component generation request."),
        }),
      }),
    ],
    tool_choice: "required",
    stream: true,
  });

  return createResponseStream(completion);
}

const createResponseStream = (
  completion: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
) => {
  return new ReadableStream<RefineQueryOutputChunk>({
    async start(controller) {
      let result: ToolCall<ReplyFunction | ComponentFunction> | null = null;
      let lastSentResult = "";

      for await (const chunk of completion) {
        const toolCall = chunk.choices[0].delta.tool_calls?.[0];

        if (!toolCall) {
          continue;
        }

        if (toolCall.id) {
          result = buildInitialResult(toolCall);
        }

        if (toolCall.function?.arguments) {
          if (!result) {
            controller.error(
              new Error(
                "Received tool call arguments, but the result was not initialized.",
              ),
            );
            return;
          }
          result.function.arguments += toolCall.function.arguments;
          try {
            result.function.parsedArguments = parse(result.function.arguments);
          } catch (error) {
            console.error(
              "[refineQuery] Error parsing arguments",
              result.function.arguments,
              error,
            );
          }
        }

        const resultString = JSON.stringify(result);
        if (result && resultString !== lastSentResult) {
          lastSentResult = resultString;
          controller.enqueue(result);
        }
      }

      controller.close();
    },
  });
};

const buildInitialResult = (
  toolCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall,
): ToolCall<ReplyFunction | ComponentFunction> => {
  const name = toolCall.function!.name as "reply" | "refine-component-query";

  switch (name) {
    case "reply":
      return {
        id: toolCall.id!,
        type: "function",
        function: {
          name,
          arguments: toolCall.function!.arguments ?? "",
          parsedArguments: { message: "" },
        },
      };
    case "refine-component-query":
      return {
        id: toolCall.id!,
        type: "function",
        function: {
          name,
          arguments: toolCall.function!.arguments ?? "",
          parsedArguments: { refinedQuery: "" },
        },
      };
  }
};
