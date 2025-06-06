import { useEffect, useState } from "react";

import { useGetChatQuery, usePatchChatMutation } from "~/lib/api";
import { skipToken } from "@reduxjs/toolkit/query";
import { LoadingButton } from "./loading-button";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface DialogRenameChatProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chatId: string | null;
}

export function DialogRenameChat({
  chatId,
  open,
  setOpen,
}: DialogRenameChatProps) {
  const { data } = useGetChatQuery(chatId ? chatId : skipToken);
  const [patchChat, { isLoading }] = usePatchChatMutation();

  const [title, setTitle] = useState(data?.title ?? "");

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!chatId) return;
    await patchChat({ id: chatId, title });
    setOpen(false);
  };

  useEffect(() => {
    setTitle((prev) => prev ?? data?.title ?? "");
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
          <DialogDescription>
            Choose a name for this chat. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            autoFocus
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <LoadingButton loading={isLoading} type="submit">
              Rename
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
