import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";

import type { Message } from "./types.js";
import { Actor } from "./actor.js";

const iot = new IoTDataPlaneClient({
  // Use endpoint from SST resources or environment variable
  endpoint: process.env.IOT_ENDPOINT,
});

export namespace Realtime {
  type MessageEvent = {
    type: "message";
    message: Omit<Message, "context">;
  };

  type TitleEvent = {
    type: "title";
    title: string;
  };

  type RealtimeEvent = MessageEvent | TitleEvent;

  async function publishEvent(topic: string, event: RealtimeEvent): Promise<void> {
    try {
      await iot.send(
        new PublishCommand({
          topic,
          payload: JSON.stringify(event),
        })
      );
    } catch (error) {
      console.error("Failed to publish realtime event", {
        topic,
        event,
        error: error instanceof Error ? error.message : "Unknown error",
        time: new Date().toISOString(),
      });
      // Don't throw - realtime updates are non-critical
    }
  }

  export async function onTitleChanged(chatId: string, title: string): Promise<void> {
    const { userId } = Actor.useUser();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${chatId}`;

    await publishEvent(topic, { type: "title", title });
  }

  export async function onMessageChanged({ context: _, ...message }: Message): Promise<void> {
    const { userId } = Actor.useUser();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${message.chatId}`;

    await publishEvent(topic, {
      type: "message",
      message,
    });
  }
}
