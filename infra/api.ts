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
           "https://d25kddx7nt9s6w.cloudfront.net",
           "http://localhost:5173"
      ],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: "1 day",
    },
  },
});
