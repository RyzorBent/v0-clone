import { dns } from "./dns";
import { db, github } from "./secrets";

export const web = new sst.aws.Nextjs("Web", {
  path: "packages/web",
  link: [db, ...github],
  domain:
    $app.stage === "production"
      ? {
          name: "project-4.headstarter.tech",
          dns,
        }
      : undefined,
  warm: $app.stage === "production" ? 1 : 0,
});
