import type { SerializeFrom } from "@remix-run/node";

import type { schema } from "@project-4/core/db";

import { useCurrentChat } from "./hooks";

export function Messages() {
  const { messages } = useCurrentChat();
  return messages.map((message) => (
    <Message key={message.id} message={message} />
  ));
}

function Message({ message }: { message: SerializeFrom<schema.Message> }) {
  return <div>{message.content}</div>;
}
