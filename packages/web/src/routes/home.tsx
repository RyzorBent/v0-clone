import { useAuth, useClerk } from "@clerk/clerk-react";
import { ArrowUpRightFromSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateChatMutation, useCreateMessageMutation } from "~/lib/api";
import { useNavigateToChat } from "~/lib/hooks";
import { cn } from "~/lib/utils";

export function HomePage() {
  const {
    input,
    handleInputChange,
    handleSubmit,
    createChatWithMessage,
    isLoading,
  } = useCreateChatWithMessage();

  return (
    <div className="relative isolate flex h-screen flex-1 items-center justify-center">
      <BackgroundPattern />

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold">
            What can I help you ship today?
          </h1>
          <p className="text-muted-foreground">
            Generate UI, ask questions, fix bugs, and more.
          </p>
        </div>
        <form
          className="flex w-full max-w-xl flex-row gap-2"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="Ask v0"
            value={input}
            onChange={handleInputChange}
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

function BackgroundPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
    >
      <defs>
        <pattern
          x="50%"
          y={-1}
          id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
          width={200}
          height={200}
          patternUnits="userSpaceOnUse"
        >
          <path d="M100 200V.5M.5 .5H200" fill="none" />
        </pattern>
      </defs>
      <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
        <path
          d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
          strokeWidth={0}
        />
      </svg>
      <rect
        fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
        width="100%"
        height="100%"
        strokeWidth={0}
      />
    </svg>
  );
}

const useCreateChatWithMessage = () => {
  const auth = useAuth();
  const clerk = useClerk();
  const [createChat, { isLoading }] = useCreateChatMutation();
  const [createMessage] = useCreateMessageMutation();
  const [input, setInput] = useState("");
  const navigateToChat = useNavigateToChat();

  const createChatWithMessage = async (message: string) => {
    if (!auth.isSignedIn) {
      clerk.openSignIn();
      return;
    }
    const res = await createChat();
    if (res.error) {
      toast.error("Sorry, something went wrong. Please try again.");
      return;
    }
    await Promise.all([
      createMessage({
        chatId: res.data.id,
        role: "user",
        content: message,
      }),
      navigateToChat(res.data.id),
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createChatWithMessage(input);
  };

  return {
    input,
    handleInputChange,
    handleSubmit,
    createChatWithMessage,
    isLoading,
  };
};
