import type { Message } from "../messages";
export declare namespace Prompt {
    const generateTitle: (messages: Pick<Message, "role" | "content">[]) => string;
    const refineQuery: (messages: Pick<Message, "role" | "content" | "toolCalls">[]) => string;
    const generateComponent: (input: {
        query: string;
        componentsContext: string;
        blocksContext: string;
    }) => string;
}
//# sourceMappingURL=prompt.d.ts.map