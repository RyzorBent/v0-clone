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

export const useArtifacts = () => {
  const chat = useCurrentChat();
  return chat.messages
    .reverse()
    .filter((message) => message.content?.includes("<Artifact"))
    .flatMap((message) => extractArtifacts(message.content!).artifacts);
};

export function extractArtifacts(content?: string) {
  const artifacts: {
    title: string;
    identifier: string;
    content: string;
  }[] = [];
  const regex =
    /<Artifact\s+title="([^"]+)"\s+identifier="([^"]+)"\s+type="([^"]+)">([\s\S]*?)(?:<\/Artifact>|$)/g;

  const cleanedContent = content?.replace(
    regex,
    (_, title, identifier, type, artifactContent) => {
      artifacts.push({
        title,
        identifier,
        content: artifactContent.trim(),
      });
      return `<Artifact title="${title}" identifier="${identifier}" type="${type}" />`;
    },
  );

  return {
    content: cleanedContent,
    artifacts,
  };
}

export function completeReactCode(incompleteCode: string): string {
  let completedCode = incompleteCode.trim();
  const openTags: string[] = [];
  const openBrackets: string[] = [];
  const openParentheses: string[] = [];

  // Helper function to close all open elements
  const closeAllOpen = () => {
    while (openTags.length > 0) {
      completedCode += `</${openTags.pop()}>`;
    }
    completedCode += ")".repeat(openParentheses.length);
    completedCode += "}".repeat(openBrackets.length);
    openParentheses.length = 0;
    openBrackets.length = 0;
  };

  // Process each character in the code
  for (let i = 0; i < completedCode.length; i++) {
    const char = completedCode[i];
    if (char === "<" && completedCode[i + 1] !== "/") {
      const tagMatch = completedCode.slice(i).match(/^<(\w+)/);
      if (tagMatch) {
        openTags.push(tagMatch[1]);
      }
    } else if (char === "<" && completedCode[i + 1] === "/") {
      openTags.pop();
    } else if (char === "{") {
      openBrackets.push("{");
    } else if (char === "}") {
      openBrackets.pop();
    } else if (char === "(") {
      openParentheses.push("(");
    } else if (char === ")") {
      openParentheses.pop();
    }
  }

  // Close any remaining open elements
  closeAllOpen();

  // // Ensure the code is wrapped in a function component if it's not already
  // if (!completedCode.includes('function') && !completedCode.includes('=>')) {
  //   completedCode = `function Component() {\n  return (\n    ${completedCode}\n  );\n}\n\nexport default Component;`;
  // }

  // // Add import statement for React if it's missing
  // if (!completedCode.includes('import React')) {
  //   completedCode = `import React from 'react';\n\n${completedCode}`;
  // }

  return completedCode;
}

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
            messages: [...(chat?.messages ?? []), message].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
          };
        } else {
          const messages = [...(chat?.messages ?? [])];
          messages[index] = message;
          return {
            ...chat,
            messages: messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
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
