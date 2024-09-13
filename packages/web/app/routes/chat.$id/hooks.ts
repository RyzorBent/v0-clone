import { useParams } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { RouteManifest } from "~/api/client";
import { useApiConfig, useChat } from "~/api/hooks";
import { RealTimeClient } from "~/lib/real-time-client";

type Chat = RouteManifest["/chats/:id"]["get"]["response"];
type Message = Chat["messages"][number];

export const useCurrentChat = () => {
  const id = useParams().id!;
  return useChat(id)!;
};

export const useChatConnection = () => {
  const id = useParams().id!;
  const { api, realtime } = useApiConfig();
  const [, setClient] = useState<RealTimeClient | null>(null);

  const queryClient = useQueryClient();

  const updateChatMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData(["/chats/:id", { id }], (chat?: Chat) => {
        const index =
          chat?.messages.findIndex((m) => m.id === message.id) ?? -1;
        if (index === -1) {
          return {
            ...chat,
            messages: [...(chat?.messages ?? []), message],
          };
        } else {
          const messages = [...(chat?.messages ?? [])];
          messages[index] = message;
          return {
            ...chat,
            messages,
          };
        }
      });
    },
    [id, queryClient],
  );
  const updateChatTitle = useCallback(
    (title: string) => {
      queryClient.setQueryData(["/chats/:id", { id }], (chat?: Chat) => {
        return {
          ...chat,
          title,
        };
      });
      queryClient.setQueryData(["/chats"], (chats?: Chat[]) => {
        return chats?.map((chat) => {
          if (chat.id === id) {
            return {
              ...chat,
              title,
            };
          }
          return chat;
        });
      });
    },
    [id, queryClient],
  );

  useEffect(() => {
    let ignore = false;

    const client = new RealTimeClient({
      endpoint: realtime.endpoint,
      authorizer: realtime.authorizer,
      topic: `${realtime.namespace}/${id}`,
      token: api.token,
    });
    setClient(client);

    client.on("message", (rawData) => {
      const data = JSON.parse(rawData) as
        | { type: "message"; message: Message }
        | { type: "title"; title: string };
      switch (data.type) {
        case "message": {
          updateChatMessage(data.message);
          break;
        }
        case "title": {
          updateChatTitle(data.title);
          break;
        }
      }
    });
    client.on("connect", () => {
      console.log("connected");
    });
    client.on("disconnect", () => {
      console.log("disconnected");
    });
    client.on("error", (error) => {
      console.error(error);
    });

    client
      .connect()
      .then(() => {
        if (!ignore) {
          return client.subscribe();
        }
      })
      .then(() => {
        console.log(`subscribed to topic "${realtime.namespace}/${id}"`);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      ignore = true;
      client.disconnect();
    };
  }, [realtime, id, api.token, updateChatMessage, updateChatTitle]);

  return null;
};
