export type ComponentContext = {
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
};
export declare function retrieveComponentContext(query: string): Promise<ComponentContext>;
//# sourceMappingURL=context.d.ts.map