import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";

import type { Message } from "./types";
import { Actor } from "./actor";

const iot = new IoTDataPlaneClient();

export namespace Realtime {
  export async function onTitleChanged(chatId: string, title: string) {
    const { userId } = Actor.useUser();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({ type: "title", title }),
      }),
    );
  }

  export async function onMessageChanged(message: Message) {
    const { userId } = Actor.useUser();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${message.chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({
          type: "message",
          message,
        }),
      }),
    );
  }
}
