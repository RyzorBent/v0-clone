export declare class APIError extends Error {
    status: number;
    constructor(message: string, status: number);
    get retry(): boolean;
    static unauthorized(message?: string): APIError;
    static notFound(message?: string): APIError;
}
//# sourceMappingURL=error.d.ts.map