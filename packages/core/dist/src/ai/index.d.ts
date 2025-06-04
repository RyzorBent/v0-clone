import { Message } from "../messages/index.js";
import { ComponentContext } from "./context.js";
export declare namespace AI {
    function generateChatTitle(chatId: string, messages: Message[]): Promise<void>;
    function generateMessageResponse(chatId: string, messages: Message[]): Promise<void>;
    function handleRefineQuery(chatId: string, messages: Message[]): Promise<{
        query: string;
        context: ComponentContext;
        message: Message;
    } | null>;
}
//# sourceMappingURL=index.d.ts.map