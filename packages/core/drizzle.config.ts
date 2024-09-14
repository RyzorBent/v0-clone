import type { Config } from "drizzle-kit";
import { Resource } from "sst";

export default {
  dialect: "postgresql",
  dbCredentials: {
    url: Resource.DATABASE_URL.value,
  },
  schema: "./src/**/*.sql.ts",
  tablesFilter: ["project-4-v0_*"],
} satisfies Config;
