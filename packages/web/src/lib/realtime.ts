import { createListenerMiddleware, ListenerEffectAPI } from "@reduxjs/toolkit";
import mqtt from "mqtt";

import type { Message } from "@project-4/core/types";

import { api } from "./api";
import {
  activeChatChanged,
  initialize,
  realtimeActiveTokenChanged,
} from "./state";
import { Dispatch, State } from "./store";

const listener = createListenerMiddleware();

export const middleware = listener.middleware;

const typedStartListening = listener.startListening.withTypes<
  State,
  Dispatch
>();

type TypedListenerAPI = ListenerEffectAPI<State, Dispatch>;

export const startListening = () =>
  typedStartListening({
    actionCreator: initialize,
    effect: async (action, listenerAPI) => {
      if (
        listenerAPI.getState().state.realtimeActiveToken ===
        action.payload.token
      ) {
        console.log("[RealTimeClient] already initialized");
        return;
      }
      console.log("[RealTimeClient] initializing");
      const client = new RealTimeClient(
        action.payload.token,
        action.payload.userId,
        listenerAPI,
      );
      listenerAPI.dispatch(realtimeActiveTokenChanged(action.payload.token));
      await client.run();
    },
  });

class RealTimeClient {
  private connection: mqtt.MqttClient;

  constructor(
    token: string,
    private readonly userId: string,
    private readonly listenerAPI: TypedListenerAPI,
  ) {
    this.connection = this.createConnection(token);

    this.connection.on("connect", () => {
      console.log("[RealTimeClient] connected");
    });
    this.connection.on("disconnect", () => {
      console.log("[RealTimeClient] disconnected");
    });
    this.connection.on("end", () => {
      console.log("[RealTimeClient] end");
    });
    this.connection.on("message", (topic, payload) => {
      console.log("[RealTimeClient] message", topic);
      const chatId = topic.split("/").pop();
      if (!chatId) return;

      const body = JSON.parse(
        new TextDecoder("utf8").decode(new Uint8Array(payload)),
      ) as
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
    return mqtt.connect(
      `wss://${import.meta.env.VITE_REALTIME_ENDPOINT}/mqtt?x-amz-customauthorizer-name=${import.meta.env.VITE_REALTIME_AUTHORIZER}`,
      {
        protocolVersion: 5,
        username: "", // workaround for sst authorizer bug
        password: token,
        clientId: `client_${crypto.randomUUID()}`,
      },
    );
  }

  async run() {
    try {
      if (!this.connection.connected) {
        await new Promise((resolve) =>
          this.connection.once("connect", resolve),
        );
      }
      this.listenerAPI.cancelActiveListeners();
      await this.runEventLoop();
    } catch (error) {
      console.error("[RealTimeClient] event loop error", error);
    } finally {
      this.connection.end();
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

      const topic = `${import.meta.env.VITE_REALTIME_NAMESPACE}/${this.userId}/${chatId}`;
      await this.connection.subscribeAsync(topic, { qos: 1 });
      console.log("[RealTimeClient] subscribed to", topic);

      this.listenerAPI.dispatch(api.util.invalidateTags(["Message"]));

      const fork = this.listenerAPI.fork(async () => {
        await this.waitForChatId(chatId);
      });

      const result = await fork.result;

      console.log("[RealTimeClient] unsubscribing from", topic);
      this.connection.unsubscribe(topic);

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
      (action) => activeChatChanged.match(action) && action.payload !== chatId,
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
