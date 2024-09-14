import { Markdown } from "~/components/markdown";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useMessage, useReversedMessageIndices } from "./hooks";

export function Messages() {
  const { indices } = useReversedMessageIndices();

  return (
    <div className="flex h-full flex-col-reverse overflow-y-auto">
      <div className="flex-1" />
      {indices.map((index) => (
        <MessageItem key={index} index={index} />
      ))}
    </div>
  );
}

function MessageItem({ index }: { index: number }) {
  const { message } = useMessage(index);

  if (!message) return null;

  return (
    <div className="flex w-full flex-row gap-3 p-4">
      <div className="flex gap-2">
        <Avatar className="border">
          <AvatarFallback className="text-sm text-muted-foreground">
            {message.role === "user" ? "You" : "v0"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-1 text-primary">
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  );
}
