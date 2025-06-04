import { ExtractTablesWithRelations } from "drizzle-orm";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";
import { schema } from "./schema";
export type Transaction = PgTransaction<NeonQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
export declare function withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<any>;
//# sourceMappingURL=transaction.d.ts.map