import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createChat } from "~/server/actions";

export default function Page() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">What can I help you ship today?</h1>
        <p className="text-muted-foreground">
          Generate UI, ask questions, debug, execute code, and more.
        </p>
      </div>
      <form
        className="flex w-full max-w-xl items-center gap-2"
        action={createChat}
      >
        <Input placeholder="Ask me anything" name="content" />
        <Button size="icon">
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
