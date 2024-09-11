import type { Config } from "drizzle-kit";
import { Resource } from "sst";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Resource.DATABASE_URL.value,
  },
  tablesFilter: ["project-4-v0_*"],
} satisfies Config;
