import { Queue } from "@serverless-stack/resources";
import { Duration } from "aws-cdk-lib";

import { realtime } from "./realtime";
import { allSecrets } from "./secrets";

export function createQueue(stack: any) {
  const queue = new Queue(stack, "GenerateMessageResponseQueue", {
    consumer: {
      function: {
        handler:
          "packages/functions/src/subscribers/generate-message-response.handler",
        bind: [...allSecrets, realtime],
        permissions: ["iot:*"],
        memorySize: 1024,
        timeout: 300,
      },
      cdk: {
        queue: {
          visibilityTimeout: Duration.minutes(5),
          receiveMessageWaitTime: Duration.seconds(20),
        },
      },
    },
  });

  return queue;
}
