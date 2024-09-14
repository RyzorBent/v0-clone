import { createListenerMiddleware, ListenerEffectAPI } from "@reduxjs/toolkit";
import { iot, mqtt } from "aws-iot-device-sdk-v2";

import { Message } from "@project-4/core/db";

import { api } from "./api";
import { chatIdChanged, tokenChanged } from "./state";
import { Dispatch, State } from "./store";

const listener = createListenerMiddleware();

export const middleware = listener.middleware;

const startListening = listener.startListening.withTypes<State, Dispatch>();

type TypedListenerAPI = ListenerEffectAPI<State, Dispatch>;

if (typeof window !== "undefined") {
  startListening({
    actionCreator: tokenChanged,
    effect: async (action, listenerAPI) => {
      if (!action.payload) {
        console.warn("[RealTimeClient] no token");
        return;
      }
      const client = new RealTimeClient(action.payload, listenerAPI);
      await client.run();
    },
  });
}

class RealTimeClient {
  private connection: mqtt.MqttClientConnection;
  private decoder = new TextDecoder("utf8");

  constructor(
    token: string,
    private readonly listenerAPI: TypedListenerAPI,
  ) {
    this.connection = this.createConnection(token);
    this.connection.on("connect", () => {
      console.log("[RealTimeClient] connected");
    });
    this.connection.on("disconnect", () => {
      console.log("[RealTimeClient] disconnected");
    });
    this.connection.on("message", (topic, rawData) => {
      const chatId = topic.split("/").pop();
      if (!chatId) return;

      const body = JSON.parse(this.decoder.decode(new Uint8Array(rawData))) as
        | { type: "title"; title: string }
        | { type: "message"; message: Message };

      if (body.type === "title") {
        this.handleTitleEvent(chatId, body.title);
      } else if (body.type === "message") {
        this.handleMessageEvent(chatId, body.message);
      }
    });
    this.connection.on("error", (error) => {
      console.error("[RealTimeClient] connection error", error);
    });
  }

  private createConnection(token: string) {
    const client = new mqtt.MqttClient();
    const id = window.crypto.randomUUID();
    return client.new_connection(
      iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id(id)
        .with_endpoint(import.meta.env.VITE_REALTIME_ENDPOINT)
        .with_custom_authorizer(
          "",
          import.meta.env.VITE_REALTIME_AUTHORIZER,
          "",
          token,
        )
        .build(),
    );
  }

  async run() {
    try {
      this.listenerAPI.cancelActiveListeners();
      await this.connection.connect();
      await this.runEventLoop();
    } catch (error) {
      console.error("[RealTimeClient] event loop error", error);
    } finally {
      await this.connection.disconnect().catch(() => null);
    }
  }

  private async runEventLoop() {
    while (!this.listenerAPI.signal.aborted) {
      const chatId = this.getChatId();

      if (!chatId) {
        console.log("[RealTimeClient] waiting for chatId");
        await this.waitForChatId(chatId);
        continue;
      }

      console.log("[RealTimeClient] subscribing to", chatId);

      const topic = `${import.meta.env.VITE_REALTIME_NAMESPACE}/${chatId}`;
      await this.connection.subscribe(topic, mqtt.QoS.AtLeastOnce);

      const fork = this.listenerAPI.fork(async () => {
        await this.waitForChatId(chatId);
      });

      const result = await fork.result;

      console.log("[RealTimeClient] unsubscribing from", chatId);
      await this.connection.unsubscribe(topic);

      if (result.status === "ok") {
        continue;
      } else {
        break;
      }
    }
  }

  private getChatId() {
    return this.listenerAPI.getState().state.chatId;
  }

  private async waitForChatId(chatId: string | null) {
    await this.listenerAPI.condition(
      (action) => chatIdChanged.match(action) && action.payload !== chatId,
    );
  }

  private handleTitleEvent(chatId: string, title: string) {
    if (this.listenerAPI.signal.aborted) return;

    this.listenerAPI.dispatch(
      api.util.updateQueryData("getChat", chatId, (chat) => {
        return { ...chat, title };
      }),
    );
    this.listenerAPI.dispatch(
      api.util.updateQueryData("listChats", void 0, (chats) => {
        return chats.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, title };
          }
          return chat;
        });
      }),
    );
  }

  private handleMessageEvent(chatId: string, message: Message) {
    if (this.listenerAPI.signal.aborted) return;

    this.listenerAPI.dispatch(
      api.util.updateQueryData("listMessages", chatId, (messages) => {
        const index = messages.findIndex((m) => m.id === message.id);
        const updatedMessages = [...messages];
        if (index === -1) {
          updatedMessages.push(message);
        } else {
          updatedMessages[index] = message;
        }
        return updatedMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      }),
    );
  }
}
