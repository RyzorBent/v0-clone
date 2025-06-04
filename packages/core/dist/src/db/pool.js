import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Resource } from "sst";
import ws from "ws";
import { createContext } from "../context";
import { schema } from "./schema";
neonConfig.webSocketConstructor = ws;
const poolContext = createContext();
export async function createPool(fn) {
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
//# sourceMappingURL=pool.js.map