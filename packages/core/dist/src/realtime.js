import { IoTDataPlaneClient, PublishCommand, } from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";
import { Actor } from "./actor.js";
const iot = new IoTDataPlaneClient({
    // Use endpoint from SST resources or environment variable
    endpoint: process.env.IOT_ENDPOINT,
});
export var Realtime;
(function (Realtime) {
    async function publishEvent(topic, event) {
        try {
            await iot.send(new PublishCommand({
                topic,
                payload: JSON.stringify(event),
            }));
        }
        catch (error) {
            console.error("Failed to publish realtime event", {
                topic,
                event,
                error: error instanceof Error ? error.message : "Unknown error",
                time: new Date().toISOString(),
            });
            // Don't throw - realtime updates are non-critical
        }
    }
    async function onTitleChanged(chatId, title) {
        const { userId } = Actor.useUser();
        const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${chatId}`;
        await publishEvent(topic, { type: "title", title });
    }
    Realtime.onTitleChanged = onTitleChanged;
    async function onMessageChanged({ context: _, ...message }) {
        const { userId } = Actor.useUser();
        const topic = `${Resource.App.name}/${Resource.App.stage}/${userId}/${message.chatId}`;
        await publishEvent(topic, {
            type: "message",
            message,
        });
    }
    Realtime.onMessageChanged = onMessageChanged;
})(Realtime || (Realtime = {}));
//# sourceMappingURL=realtime.js.map