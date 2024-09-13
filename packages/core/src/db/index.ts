import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";

import * as schema from "./schema";

const client = neon(Resource.DATABASE_URL.value);
export const db = drizzle(client, { schema });

export { schema };
