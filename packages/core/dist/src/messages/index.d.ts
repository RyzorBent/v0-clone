import { z } from "zod";
import { messages } from "./message.sql.js";
export type Message = typeof messages.$inferSelect;
export type { Message as Type };
export declare namespace Message {
    const Insert: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["user", "assistant", "tool"]>;
        content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        toolCallId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        toolCalls: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnknown, "many">>>>>;
        context: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNullable<z.ZodObject<{
            components: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                score: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                content: string;
                score?: number | undefined;
            }, {
                id: string;
                content: string;
                score?: number | undefined;
            }>, "many">;
            blocks: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                score: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                content: string;
                score?: number | undefined;
            }, {
                id: string;
                content: string;
                score?: number | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            components: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
            blocks: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
        }, {
            components: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
            blocks: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
        }>>>>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<["thinking", "planning", "retrieving-context", "generating-component"]>;
        }, "strip", z.ZodTypeAny, {
            status: "thinking" | "planning" | "retrieving-context" | "generating-component";
        }, {
            status: "thinking" | "planning" | "retrieving-context" | "generating-component";
        }>>>>>;
        createdAt: z.ZodOptional<z.ZodDate>;
        chatId: z.ZodString;
    }, z.UnknownKeysParam, z.ZodTypeAny, {
        role: "user" | "assistant" | "tool";
        chatId: string;
        id?: string | undefined;
        content?: string | null | undefined;
        toolCallId?: string | null | undefined;
        toolCalls?: unknown[] | null | undefined;
        context?: {
            components: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
            blocks: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
        } | null | undefined;
        metadata?: {
            status: "thinking" | "planning" | "retrieving-context" | "generating-component";
        } | null | undefined;
        createdAt?: Date | undefined;
    }, {
        role: "user" | "assistant" | "tool";
        chatId: string;
        id?: string | undefined;
        content?: string | null | undefined;
        toolCallId?: string | null | undefined;
        toolCalls?: unknown[] | null | undefined;
        context?: {
            components: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
            blocks: {
                id: string;
                content: string;
                score?: number | undefined;
            }[];
        } | null | undefined;
        metadata?: {
            status: "thinking" | "planning" | "retrieving-context" | "generating-component";
        } | null | undefined;
        createdAt?: Date | undefined;
    }>;
    type Insert = z.infer<typeof Insert>;
    const Event: {
        generateResponse: {
            input: z.ZodObject<{
                actor: z.ZodObject<{
                    type: z.ZodLiteral<"user">;
                    userId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    userId: string;
                    type: "user";
                }, {
                    userId: string;
                    type: "user";
                }>;
                message: z.ZodObject<{
                    id: z.ZodString;
                    role: z.ZodEnum<["user", "assistant", "tool"]>;
                    content: z.ZodNullable<z.ZodString>;
                    toolCallId: z.ZodNullable<z.ZodString>;
                    toolCalls: z.ZodNullable<z.ZodNullable<z.ZodArray<z.ZodUnknown, "many">>>;
                    context: z.ZodNullable<z.ZodNull>;
                    metadata: z.ZodNullable<z.ZodNull>;
                    chatId: z.ZodString;
                    createdAt: z.ZodDate;
                }, z.UnknownKeysParam, z.ZodTypeAny, {
                    id: string;
                    role: "user" | "assistant" | "tool";
                    content: string | null;
                    toolCallId: string | null;
                    toolCalls: unknown[] | null;
                    context: null;
                    metadata: null;
                    createdAt: Date;
                    chatId: string;
                }, {
                    id: string;
                    role: "user" | "assistant" | "tool";
                    content: string | null;
                    toolCallId: string | null;
                    toolCalls: unknown[] | null;
                    context: null;
                    metadata: null;
                    createdAt: Date;
                    chatId: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                message: {
                    id: string;
                    role: "user" | "assistant" | "tool";
                    content: string | null;
                    toolCallId: string | null;
                    toolCalls: unknown[] | null;
                    context: null;
                    metadata: null;
                    createdAt: Date;
                    chatId: string;
                };
                actor: {
                    userId: string;
                    type: "user";
                };
            }, {
                message: {
                    id: string;
                    role: "user" | "assistant" | "tool";
                    content: string | null;
                    toolCallId: string | null;
                    toolCalls: unknown[] | null;
                    context: null;
                    metadata: null;
                    createdAt: Date;
                    chatId: string;
                };
                actor: {
                    userId: string;
                    type: "user";
                };
            }>;
        };
    };
    function list(chatId: string): Promise<any>;
    function create(input: z.infer<typeof Insert>): Promise<{
        id: string;
        role: "user" | "assistant" | "tool";
        content: string | null;
        toolCallId: string | null;
        toolCalls: unknown[] | null;
        context: {
            components: {
                id: string;
                content: string;
                score?: number;
            }[];
            blocks: {
                id: string;
                content: string;
                score?: number;
            }[];
        } | null;
        metadata: {
            status: "thinking" | "planning" | "retrieving-context" | "generating-component";
        } | null;
        createdAt: Date;
        chatId: string;
    }>;
    function patch(message: Message): Promise<void>;
    function del(id: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map