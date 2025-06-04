import { OpenAI } from "openai";
import { Message } from "../messages";
interface ToolCallFunction<T extends string, U> {
    name: T;
    arguments: string;
    parsedArguments: U;
}
export interface ToolCall<Function extends ToolCallFunction<string, Record<string, unknown>>> extends OpenAI.ChatCompletionMessageToolCall {
    id: string;
    type: "function";
    function: Function;
}
export type ReplyFunction = ToolCallFunction<"reply", {
    message: string;
}>;
export type ComponentFunction = ToolCallFunction<"refine-component-query", {
    refinedQuery: string;
}>;
export type RefineQueryOutputChunk = ToolCall<ReplyFunction | ComponentFunction>;
export declare function refineQuery(messages: Message[]): Promise<import("stream/web").ReadableStream<RefineQueryOutputChunk>>;
export {};
//# sourceMappingURL=refine-query.d.ts.map