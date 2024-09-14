import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Message } from "../messages/message.sql";
import { Resource } from "sst";

const iot = new IoTDataPlaneClient();

export namespace RealtimeAPI {
  export async function onTitleChanged(chatId: string, title: string) {
    console.log("onTitleChanged", chatId, title);
    const topic = `${Resource.App.name}/${Resource.App.stage}/${chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({ type: "title", title }),
      })
    );
  }

  export async function onMessageChanged(message: Message) {
    console.log("onMessageChanged", message);
    const topic = `${Resource.App.name}/${Resource.App.stage}/${message.chatId}`;

    await iot.send(
      new PublishCommand({
        topic,
        payload: JSON.stringify({ type: "message", message }),
      })
    );
  }
}
