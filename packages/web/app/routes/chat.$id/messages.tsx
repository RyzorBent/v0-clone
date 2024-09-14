import type { SerializeFrom } from "@remix-run/node";

import type { schema } from "@project-4/core/db";

import { extractArtifacts, useCurrentChat } from "./hooks";

export function Messages() {
  const { messages } = useCurrentChat();
  return messages.map((message) => (
    <Message key={message.id} message={message} />
  ));
}

function Message({ message }: { message: SerializeFrom<schema.Message> }) {
  if (message.role === "tool") return null;
  if (!message.content && message.toolCalls) {
    return <div>Generating...</div>;
  }
  return <div>{extractArtifacts(message.content!).content}</div>;
}
