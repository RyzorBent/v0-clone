import { ErrorResponse, useParams, useRouteError } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateMessageMutation } from "~/lib/api";
import { useTypedDispatch } from "~/lib/hooks";
import { chatIdChanged } from "~/lib/state";
import { Editor } from "./editor";
import { Messages } from "./messages";

export default function Chat() {
  const params = useParams() as { id: string };
  const dispatch = useTypedDispatch();

  useEffect(() => {
    dispatch(chatIdChanged(params.id));
  }, [dispatch, params.id]);

  return (
    <main className="grid h-screen flex-1 grid-cols-2 divide-x bg-muted/25">
      <div className="flex h-screen flex-col divide-y">
        <Messages />
        <MessageInput chatId={params.id} />
      </div>
      <Editor key={params.id} />
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
        createMessage({ chatId, role: "user", content: content });
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
