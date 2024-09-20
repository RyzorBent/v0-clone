import { ExtractTablesWithRelations } from "drizzle-orm";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";

import { createContext } from "../context";
import { usePool } from "./pool";
import { schema } from "./schema";

export type Transaction = PgTransaction<
  NeonQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

const txContext = createContext<Transaction>();

export async function withTransaction<T>(fn: (tx: Transaction) => Promise<T>) {
  const tx = txContext.get();
  if (!tx) {
    const db = usePool();
    const result = await db.transaction(async (tx) => {
      return await txContext.with(tx, () => fn(tx));
    });
    return result;
  }
  return await fn(tx);
}
