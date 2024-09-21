import { Check, Globe, Link, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useGetChatQuery, usePatchChatMutation } from "~/lib/api";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Switch } from "./ui/switch";

interface DialogShareChatProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chatId: string | null;
}

export function DialogShareChat({
  open,
  setOpen,
  chatId,
}: DialogShareChatProps) {
  const [patchChat, { isLoading }] = usePatchChatMutation();
  const { data } = useGetChatQuery(chatId ?? "", { skip: !chatId });

  const [isPublic, setIsPublic] = useState(data?.public ?? false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsPublic(data?.public ?? false);
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
          <DialogDescription>
            Chats are private by default, but can be shared via a link. By
            sharing this chat, all of its messages will be visible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded border p-2">
          <div className="aspect-square rounded bg-muted p-4 text-muted-foreground">
            {isPublic ? (
              <Globe className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <p className="font-semibold">Chat Link</p>
            <p className="text-sm text-muted-foreground">
              {isPublic
                ? "Anyone with the link can view this chat."
                : "Only you can view this chat."}
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={async (checked) => {
              setIsPublic(checked);
              if (chatId) {
                const result = await patchChat({ id: chatId, public: checked });
                if (result.error) {
                  toast.error("Failed to update chat visibility");
                  setIsPublic(!checked);
                }
              }
            }}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
          <Button
            disabled={!isPublic}
            type="submit"
            onClick={() => {
              setIsCopied(true);
              navigator.clipboard.writeText(
                `${window.location.origin}/${chatId}`,
              );
              setTimeout(() => setIsCopied(false), 2500);
            }}
          >
            <div className="relative mr-1.5 size-4">
              <Link
                className={cn(
                  "absolute size-4 transition-opacity duration-100",
                  isCopied ? "opacity-0 delay-0" : "opacity-100 delay-75",
                )}
              />
              <Check
                className={cn(
                  "absolute size-4 transition-opacity duration-100",
                  isCopied ? "opacity-100 delay-75" : "opacity-0 delay-0",
                )}
              />
            </div>
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
