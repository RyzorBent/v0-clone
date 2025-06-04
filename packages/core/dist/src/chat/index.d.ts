import { z } from "zod";
import { chats } from "./chat.sql";
export type Chat = typeof chats.$inferSelect;
export declare namespace Chat {
    const PatchInput: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        public: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        public?: boolean | undefined;
        title?: string | undefined;
    }, {
        public?: boolean | undefined;
        title?: string | undefined;
    }>;
    type PatchInput = z.infer<typeof PatchInput>;
    function list(): Promise<any>;
    function get(chatId: string): Promise<any>;
    function create(): Promise<any>;
    function patch(chatId: string, input: z.infer<typeof PatchInput>): Promise<any>;
    function del(id: string): Promise<any>;
    function touch(id: string): Promise<any>;
}
//# sourceMappingURL=index.d.ts.map