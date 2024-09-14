import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst/resource";
import { z } from "zod";
import { MessageSchema } from "../db/schema";

const queue = new SQSClient({});

export namespace QueueAPI {
  export const GenerateChatTitleInput = z.object({
    chatId: z.string(),
  });

  export const GenerateMessageResponseInput = z.object({
    message: MessageSchema,
  });

  type EnqueueInput =
    | {
        type: "GenerateChatTitleQueue";
        body: z.infer<typeof GenerateChatTitleInput>;
      }
    | {
        type: "GenerateMessageResponseQueue";
        body: z.infer<typeof GenerateMessageResponseInput>;
      };

  export async function enqueue({ type, body }: EnqueueInput) {
    await queue.send(
      new SendMessageCommand({
        QueueUrl: Resource[type].url,
        MessageBody: JSON.stringify(body),
      })
    );
  }
}
