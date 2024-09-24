import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Message } from "@project-4/core/types";

import { useListMessagesQuery, usePrefetch } from "~/lib/api";
import { activeChatChanged } from "./state";
import { useAppDispatch, useAppSelector } from "./store";

interface Artifact {
  title: string;
  identifier: string;
  content: string;
  isComplete: boolean;
}

export const useNavigateToChat = () => {
  const navigate = useNavigate();
  const prefetchChat = usePrefetch("getChat");
  const prefetchMessages = usePrefetch("listMessages");
  const dispatch = useAppDispatch();

  return (chatId: string) => {
    dispatch(activeChatChanged(chatId));
    prefetchChat(chatId);
    prefetchMessages(chatId);
    navigate(`/${chatId}`);
  };
};

export const useAuthLoaded = () => {
  const token = useAppSelector(({ state }) => state.token);
  const { isLoaded, isSignedIn, userId } = useAuth();
  if (!isLoaded) return { isLoaded: false, userId: null };
  if (!isSignedIn || !token) return { isLoaded: true, userId: null };
  return { isLoaded: true, userId };
};

export const useChatId = () => {
  const { id } = useParams() as { id: string };
  return id;
};

export const useReversedMessageIds = () => {
  const chatId = useChatId();
  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data }) => {
      return {
        ids: (data?.map((message) => message.id) ?? []).reverse(),
      };
    },
  });
};

const NULL = {
  type: null,
} as Omit<NormalizedMessage, "artifacts">;

export const useMessage = (id: string) => {
  const chatId = useChatId();
  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data }): Omit<NormalizedMessage, "artifacts"> => {
      if (!data) return NULL;
      const index = data.findIndex((message) => message.id === id);
      if (index === -1) return NULL;
      const { artifacts: _, ...message } = normalizeMessage(data[index]);
      if (message.type === "status" && data[index + 1]?.content) {
        return NULL;
      }
      return message;
    },
  });
};

export const useArtifact = () => {
  const chatId = useChatId();

  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data, isSuccess }) => {
      if (!data) return { artifact: null, isSuccess };
      for (let i = data.length - 1; i >= 0; i--) {
        const normalizedMessage = normalizeMessage(data[i]);
        if (
          normalizedMessage?.type === "message" &&
          normalizedMessage.artifacts
        ) {
          return {
            messageId: normalizedMessage.message.id,
            artifact:
              normalizedMessage.artifacts[
                normalizedMessage.artifacts.length - 1
              ] ?? null,
            isSuccess,
          };
        }
      }
      return { artifact: null, isSuccess };
    },
  });
};

export const useArtifactExists = () => {
  const { artifact } = useArtifact();
  return useMemo(() => artifact !== null, [artifact]);
};

type NormalizedMessage =
  | {
      type: "message";
      message: Message;
      status: never;
      artifacts?: Artifact[];
    }
  | {
      type: "status";
      message: Message;
      status: "generating-component" | "retrieving-context" | "thinking";
      artifacts: never;
    }
  | { type: null; message: never; status: never; artifacts: never };

const normalizeMessage = (message: Message): NormalizedMessage => {
  if (message.role !== "assistant") {
    return {
      type: "message",
      message,
    } as NormalizedMessage;
  } else if (!message.content) {
    if (!message.metadata?.status) {
      return { type: null } as NormalizedMessage;
    }
    return {
      type: "status",
      message,
      status: message.metadata.status,
    } as NormalizedMessage;
  }

  const artifacts: Artifact[] = [];
  const regex =
    /<Artifact\s+title="([^"]+)"\s+identifier="([^"]+)"\s+type="([^"]+)">([\s\S]*?)(<\/Artifact>|$)/g;

  const normalizedContent = message.content.replace(
    regex,
    (_, title, identifier, type, artifactContent, closingTag) => {
      artifacts.push({
        title,
        identifier,
        content: artifactContent.trim().replaceAll(/(```[^\n]*\n?|```)/g, ""),
        isComplete: !!closingTag,
      });
      return `<Artifact title="${title}" identifier="${identifier}" type="${type}" isComplete={${!!closingTag}} />`;
    },
  );

  return {
    type: "message" as const,
    message: {
      ...message,
      content: normalizedContent,
    },
    artifacts: artifacts.length > 0 ? artifacts : undefined,
  } as NormalizedMessage;
};
