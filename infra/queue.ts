import { realtime } from "./realtime";
import { allSecrets } from "./secrets";

export const generateMessageResponseQueue = new sst.aws.Queue(
  "GenerateMessageResponseQueue"
);
generateMessageResponseQueue.subscribe({
  handler:
    "packages/functions/src/subscribers/generate-message-response.handler",
  link: [...allSecrets, realtime],
  permissions: [
    {
      actions: ["iot:*"],
      resources: ["*"],
    },
  ],
});
