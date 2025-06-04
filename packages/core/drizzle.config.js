import { Resource } from "sst";
export default {
    dialect: "postgresql",
    dbCredentials: {
        url: Resource.DatabaseURL.value,
    },
    schema: "./src/**/*.sql.ts",
    tablesFilter: ["project-4-v0_*"],
};
