import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";

import type { Message } from "@project-4/core/types";

import { useListMessagesQuery, usePrefetch } from "~/lib/api";
import { useAppDispatch, useAppSelector } from "./store";
import { activeChatChanged } from "./state";
import { useMemo } from "react";

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

export const useIsAuthLoaded = () => {
  const token = useAppSelector(({ state }) => state.token);
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return false;
  if (!isSignedIn) return true;
  return !!token;
};

export const useChatId = () => {
  const { id } = useParams() as { id: string };
  return id;
};

export const useReversedMessageIndices = () => {
  const chatId = useChatId();
  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data }) => {
      return {
        indices: (data?.map((_, index) => index) ?? []).reverse(),
      };
    },
  });
};

export const useMessage = (messageIndex: number) => {
  const chatId = useChatId();
  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data }) => {
      const message = data?.[messageIndex];
      return {
        message: message ? normalizeMessage(message) : null,
      };
    },
  });
};

export const useArtifact = () => {
  const chatId = useChatId();

  return useListMessagesQuery(chatId, {
    selectFromResult: ({ data, isSuccess }) => {
      if (!data) return { code: null, isSuccess };
      for (let i = data.length - 1; i >= 0; i--) {
        const message = normalizeMessage(data[i]);
        if (message && "artifacts" in message && message.artifacts.length > 0) {
          return {
            artifact: message.artifacts[message.artifacts.length - 1] ?? null,
            isSuccess,
          };
        }
      }
      return { code: null, isSuccess };
    },
  });
};

const normalizeMessage = (message?: Message) => {
  if (!message || !message.content || message.role === "tool") {
    return null;
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
        content: artifactContent.trim(),
        isComplete: !!closingTag,
      });
      return `<Artifact title="${title}" identifier="${identifier}" type="${type}" isComplete={${!!closingTag}} />`;
    },
  );

  return {
    ...message,
    content: normalizedContent,
    artifacts,
  };
};
