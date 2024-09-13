import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst/resource";
import { z } from "zod";

const queue = new SQSClient({});

export namespace QueueAPI {
  export const GenerateChatTitleInput = z.object({
    chatId: z.string(),
  });

  export const GenerateMessageResponseInput = z.object({
    message: z.object({
      id: z.string(),
      chatId: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      createdAt: z.coerce.date(),
    }),
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
