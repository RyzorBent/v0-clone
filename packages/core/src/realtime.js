import { IoTDataPlaneClient, PublishCommand, } from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";
import { Actor } from "./actor";
const iot = new IoTDataPlaneClient();
export var Realtime;
(function (Realtime) {
    async function onTitleChanged(chatId, title) {
        const { userId } = Actor.useUser();
        const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${chatId}`;
        await iot.send(new PublishCommand({
            topic,
            payload: JSON.stringify({ type: "title", title }),
        }));
    }
    Realtime.onTitleChanged = onTitleChanged;
    async function onMessageChanged({ context: _, ...message }) {
        const { userId } = Actor.useUser();
        const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${message.chatId}`;
        await iot.send(new PublishCommand({
            topic,
            payload: JSON.stringify({
                type: "message",
                message,
            }),
        }));
    }
    Realtime.onMessageChanged = onMessageChanged;
})(Realtime || (Realtime = {}));
