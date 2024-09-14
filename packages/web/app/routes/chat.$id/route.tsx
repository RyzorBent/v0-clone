import { ErrorResponse, useParams, useRouteError } from "@remix-run/react";
import { lazy, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateMessageMutation, useGetChatQuery } from "~/lib/api";
import { useTypedDispatch } from "~/lib/hooks";
import { chatIdChanged } from "~/lib/state";
import { Messages } from "./messages";

const Editor = lazy(() =>
  import("./editor").then((mod) => ({ default: mod.Editor })),
);

export default function Chat() {
  const params = useParams() as { id: string };
  const { data: chat } = useGetChatQuery(params.id);
  const dispatch = useTypedDispatch();

  useEffect(() => {
    dispatch(chatIdChanged(params.id));
  }, [dispatch, params.id]);

  return (
    <main className="grid h-screen grid-cols-2 bg-muted/25">
      <div className="flex flex-col">
        <h1>{chat?.title ?? "Untitled"}</h1>
        <div className="flex flex-1 flex-col justify-end">
          <Messages />
          <MessageInput chatId={params.id} />
        </div>
      </div>
      <div className="flex flex-col">
        <Editor />
      </div>
    </main>
  );
}

function MessageInput({ chatId }: { chatId: string }) {
  const [content, setContent] = useState("");
  const [createMessage, { isLoading }] = useCreateMessageMutation();

  return (
    <form
      className="flex flex-row gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        createMessage({ chatId, content: content });
        setContent("");
      }}
    >
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        Send
      </Button>
    </form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as Error | ErrorResponse;

  return (
    <div>
      Error: {"statusText" in error ? error.statusText : error.message}{" "}
    </div>
  );
}
