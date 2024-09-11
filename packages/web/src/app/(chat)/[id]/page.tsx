import { ChatAPI } from "@project-4/core/chat";
import { Editor } from "./_components/editor";

export default async function Page({ params }: { params: { id: string } }) {
  const chat = await ChatAPI.findById(params.id);

  return (
    <>
      <div className="flex flex-col gap-2">
        {chat?.messages.map((message) => (
          <div key={message.id}>{message.content}</div>
        ))}
      </div>
      <Editor />
    </>
  );
}
