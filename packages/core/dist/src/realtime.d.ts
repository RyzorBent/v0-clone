import type { Message } from "./types";
export declare namespace Realtime {
    function onTitleChanged(chatId: string, title: string): Promise<void>;
    function onMessageChanged({ context: _, ...message }: Message): Promise<void>;
}
//# sourceMappingURL=realtime.d.ts.map