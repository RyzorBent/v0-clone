import { useNavigate } from "@remix-run/react";
import { ArrowUpRightFromSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateChatMutation, useCreateMessageMutation } from "~/lib/api";
import { cn } from "~/lib/utils";

export default function ChatWelcome() {
  const [createChat, { isLoading }] = useCreateChatMutation();
  const [createMessage] = useCreateMessageMutation();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const createChatWithMessage = async (message: string) => {
    const res = await createChat();
    if (res.error) {
      console.error(res.error);
      toast.error("Sorry, something went wrong. Please try again.");
      return;
    }
    createMessage({
      chatId: res.data.id,
      content: message,
    });
    navigate(`/chat/${res.data.id}`);
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">
            What can I help you ship today?
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate UI, ask questions, fix bugs, and more.
          </p>
        </div>
        <form
          className="flex w-full max-w-xl flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createChatWithMessage(message);
          }}
        >
          <Input
            placeholder="Ask v0"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="aspect-square" size="icon" disabled={isLoading}>
            <Send className="size-4" />
          </Button>
        </form>
        <div className="flex flex-row gap-2">
          {[
            "Generate a multi-step onboarding flow",
            "How can I structure LLM outputs",
            "Write a custom hook for fetching data",
          ].map((prompt) => (
            <button
              key={prompt}
              className={cn(badgeVariants(), "py-1", isLoading && "opacity-50")}
              onClick={() => createChatWithMessage(prompt)}
              disabled={isLoading}
            >
              {prompt}
              <ArrowUpRightFromSquare
                className="ml-1.5 size-2.5"
                strokeWidth={4}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
