import { AppWindow, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ArtifactContent } from "~/components/artifact-content";
import { ChatHeader } from "~/components/chat-header";
import { Markdown } from "~/components/markdown";
import { Status } from "~/components/status";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  useCreateMessageMutation,
  useGetChatQuery,
  useListMessagesQuery,
} from "~/lib/api";
import {
  useArtifactExists,
  useAuthLoaded,
  useChatId,
  useMessage,
  useReversedMessageIds,
} from "~/lib/hooks";
import { artifactOpenChanged } from "~/lib/state";
import { useAppDispatch, useAppSelector } from "~/lib/store";
import { cn } from "~/lib/utils";

export function ChatPage() {
  const chatId = useChatId();
  const { isLoaded, userId } = useAuthLoaded();
  const { chat, isChatLoading } = useGetChatQuery(chatId, {
    selectFromResult: ({ data, isLoading }) => ({
      chat: data
        ? {
            id: data.id,
            userId: data.userId,
            title: data.title,
            public: data.public,
          }
        : null,
      isChatLoading: isLoading,
    }),
  });
  const messages = useListMessagesQuery(chatId, {
    selectFromResult: ({ isLoading }) => ({ isLoading }),
  });
  const artifactOpen = useAppSelector(({ state }) => state.isArtifactOpen);
  const artifactExists = useArtifactExists();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (artifactExists) {
      dispatch(artifactOpenChanged(true));
    }
  }, [artifactExists, dispatch]);

  if (isChatLoading || messages.isLoading || !isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AppWindow className="mb-2.5 size-10 text-muted-foreground" />
          <p className="text-lg font-medium">Chat Not Found</p>
          <p className="text-sm text-muted-foreground">
            This chat was deleted, made private, or does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          artifactOpen ? "w-1/2" : "w-full",
        )}
      >
        <ChatHeader chat={chat} />
        <Messages />
        {userId === chat.userId && <MessageInput chatId={chat.id} />}
      </div>
      <div
        className={cn(
          "transition-all duration-300",
          artifactOpen ? "flex w-1/2 flex-col border-l bg-muted" : "w-0",
        )}
      >
        {artifactOpen && <ArtifactContent />}
      </div>
    </>
  );
}

function MessageInput({ chatId }: { chatId: string }) {
  const [content, setContent] = useState("");
  const [createMessage, { isLoading }] = useCreateMessageMutation();

  return (
    <form
      className="mx-auto flex w-full max-w-prose flex-row gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        createMessage({ chatId, role: "user", content: content });
        setContent("");
      }}
    >
      <Input value={content} onChange={(e) => setContent(e.target.value)} />
      <Button type="submit" disabled={isLoading}>
        Send
      </Button>
    </form>
  );
}

function Messages() {
  const { ids } = useReversedMessageIds();

  return (
    <div className="flex w-full flex-1 flex-col-reverse overflow-y-auto">
      <div className="flex-1" />
      {ids.map((id) => (
        <MessageItem key={id} id={id} />
      ))}
    </div>
  );
}

function MessageItem({ id }: { id: string }) {
  const item = useMessage(id);

  if (item.type === null) return null;

  let content: React.ReactNode;
  if (item.type === "status") {
    content = <Status status={item.status} />;
  } else if (item.type === "message") {
    if (!item.message.content) {
      return null;
    }
    content = <Markdown content={item.message.content} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-prose flex-row gap-3 px-4 py-3">
      <div className="flex gap-2">
        <Avatar className="border">
          <AvatarFallback className="text-xs font-medium text-muted-foreground">
            {item.message.role === "user" ? "You" : "v0"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-1.5 text-[15px] text-primary/90">
        {content}
      </div>
    </div>
  );
}
