import { realtime } from "./realtime";
import { db, openai } from "./secrets";

export const generateChatTitleQueue = new sst.aws.Queue(
  "GenerateChatTitleQueue"
);
generateChatTitleQueue.subscribe({
  handler: "packages/functions/src/subscribers/generate-chat-title.handler",
  link: [db, openai, realtime],
});

export const generateMessageResponseQueue = new sst.aws.Queue(
  "GenerateMessageResponseQueue"
);
generateMessageResponseQueue.subscribe({
  handler:
    "packages/functions/src/subscribers/generate-message-response.handler",
  link: [db, openai, realtime, generateChatTitleQueue],
});
