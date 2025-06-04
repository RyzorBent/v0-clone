import { z } from "zod";
import { chats } from "./chat.sql.js";
export type Chat = typeof chats.$inferSelect;
export type { Chat as Type };
export declare namespace Chat {
    const PatchInput: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        public: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        public?: boolean | undefined;
    }, {
        title?: string | undefined;
        public?: boolean | undefined;
    }>;
    type PatchInput = z.infer<typeof PatchInput>;
    function list(): Promise<Chat[]>;
    function get(chatId: string): Promise<Chat | null>;
    function create(): Promise<Chat>;
    function patch(chatId: string, input: z.infer<typeof PatchInput>): Promise<void>;
    function del(id: string): Promise<void>;
    function touch(id: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map