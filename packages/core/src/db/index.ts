import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Resource } from "sst";

import * as schema from "./schema";

export const pool = new Pool({
  connectionString: Resource.DATABASE_URL.value,
});

export const db = drizzle(pool, { schema });

export { schema };
