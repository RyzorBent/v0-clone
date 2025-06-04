export declare const messageRole: import("drizzle-orm/pg-core").PgEnum<["user", "assistant", "tool"]>;
export declare const messages: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "messages";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "messages";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        role: import("drizzle-orm/pg-core").PgColumn<{
            name: "role";
            tableName: "messages";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "user" | "assistant" | "tool";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["user", "assistant", "tool"];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        content: import("drizzle-orm/pg-core").PgColumn<{
            name: "content";
            tableName: "messages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        toolCallId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tool_call_id";
            tableName: "messages";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        toolCalls: import("drizzle-orm/pg-core").PgColumn<{
            name: "tool_calls";
            tableName: "messages";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown[];
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        context: import("drizzle-orm/pg-core").PgColumn<{
            name: "context";
            tableName: "messages";
            dataType: "json";
            columnType: "PgJsonb";
            data: {
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
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        metadata: import("drizzle-orm/pg-core").PgColumn<{
            name: "metadata";
            tableName: "messages";
            dataType: "json";
            columnType: "PgJsonb";
            data: {
                status: "thinking" | "planning" | "retrieving-context" | "generating-component";
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        chatId: import("drizzle-orm/pg-core").PgColumn<{
            name: "chat_id";
            tableName: "messages";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "messages";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const messagesRelations: import("drizzle-orm").Relations<"messages", {
    chat: import("drizzle-orm").One<"chats", true>;
}>;
//# sourceMappingURL=message.sql.d.ts.map