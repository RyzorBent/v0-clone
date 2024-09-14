import { useMessage, useMessageIndices } from "./hooks";

export function Messages() {
  const { indices } = useMessageIndices();

  return indices.map((index) => <MessageItem key={index} index={index} />);
}

function MessageItem({ index }: { index: number }) {
  const { message } = useMessage(index);
  if (!message) return null;
  return <div>{message.content}</div>;
}
