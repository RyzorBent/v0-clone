import { generateMessageResponseQueue } from "./queue";
import { realtime } from "./realtime";
import { allSecrets } from "./secrets";

export const api = new sst.aws.Function("API", {
  handler: "packages/functions/src/api/index.handler",
  link: [...allSecrets, generateMessageResponseQueue, realtime],
  permissions: [
    {
      actions: ["iot:*"],
      resources: ["*"],
    },
  ],
  url: {
    cors: {
      allowCredentials: true,
      allowOrigins: [
        $app.stage === "production"
          ? "https://v0.headstarter.tech"
          : "http://localhost:5173",
      ],
    },
  },
});
