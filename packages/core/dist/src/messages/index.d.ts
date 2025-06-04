import { z } from "zod";
import { messages } from "./message.sql";
export type Message = typeof messages.$inferSelect;
export declare namespace Message {
    const Insert: z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, any, any>;
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
                    [x: string]: any;
                }, z.UnknownKeysParam, z.ZodTypeAny, {
                    [x: string]: any;
                }, {
                    [x: string]: any;
                }>;
            }, "strip", z.ZodTypeAny, {
                message: {
                    [x: string]: any;
                };
                actor: {
                    userId: string;
                    type: "user";
                };
            }, {
                message: {
                    [x: string]: any;
                };
                actor: {
                    userId: string;
                    type: "user";
                };
            }>;
        };
    };
    function list(chatId: string): Promise<any>;
    function create(input: z.infer<typeof Insert>): Promise<any>;
    function patch(message: Message): Promise<void>;
    function del(id: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map