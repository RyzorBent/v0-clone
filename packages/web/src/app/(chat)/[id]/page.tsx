import { db } from "~/server/db";
import { Editor } from "./_components/editor";

export default async function Page({ params }: { params: { id: string } }) {
  const chat = await db.query.Chat.findFirst({
    where: (Chat, { eq }) => eq(Chat.id, params.id),
    with: {
      messages: true,
    },
  });

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
