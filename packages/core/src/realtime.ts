import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";
import { Actor } from "./actor";
import type { Message } from "./types";

const iot = new IoTDataPlaneClient();

export namespace Realtime {
  export async function onTitleChanged(chatId: string, title: string) {
    const { userId } = Actor.use();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({ type: "title", title }),
      })
    );
  }

  export async function onMessageChanged(message: Message) {
    const { userId } = Actor.use();
    const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${message.chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({ type: "message", message }),
      })
    );
  }
}
