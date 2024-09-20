import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import { Resource } from "sst";
import ws from "ws";

import { createContext } from "../context";
import { schema } from "./schema";

neonConfig.webSocketConstructor = ws;

type DBClient = NeonDatabase<typeof schema>;

const poolContext = createContext<DBClient>();

export async function createPool<T>(fn: () => Promise<T>) {
  const pool = new Pool({
    connectionString: Resource.DatabaseURL.value,
  });
  const db = drizzle(pool, { schema });
  return await poolContext.with(db, async () => {
    const result = await fn();
    await pool.end();
    return result;
  });
}

export function usePool() {
  return poolContext.use();
}
