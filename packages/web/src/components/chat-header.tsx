import { useAuth } from "@clerk/clerk-react";
import {
  Lock,
  MoreHorizontal,
  Pencil,
  Share,
  Trash,
  Unlock,
} from "lucide-react";
import { useState } from "react";

import { Chat } from "@project-4/core/types";

import { DialogDeleteChat } from "~/components/dialog-delete-chat";
import { DialogRenameChat } from "~/components/dialog-rename-chat";
import { DialogShareChat } from "~/components/dialog-share-chat";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function ChatHeader({
  chat,
}: {
  chat: Pick<Chat, "id" | "userId" | "title" | "public">;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { userId } = useAuth();

  if (chat.userId !== userId) {
    return <div className="h-16" />;
  }

  return (
    <>
      <DialogShareChat
        chatId={chat.id}
        open={shareOpen}
        setOpen={setShareOpen}
      />
      <DialogRenameChat
        chatId={chat.id}
        open={renameOpen}
        setOpen={setRenameOpen}
      />
      <DialogDeleteChat
        chatId={chat.id}
        open={deleteOpen}
        setOpen={setDeleteOpen}
      />

      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 px-6 py-4">
          <div className="flex flex-1 items-center gap-1">
            <h1 className="font-semibold text-foreground">
              {chat.title ?? "Untitled Chat"}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShareOpen(true)}
                >
                  {chat.public ? (
                    <Unlock className="size-3.5" />
                  ) : (
                    <Lock className="size-3.5" />
                  )}
                  <span className="sr-only">
                    {chat.public ? "Public Chat" : "Private Chat"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {chat.public ? "This chat is public" : "This chat is private"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShareOpen(true)}
                >
                  <Share className="size-3.5" />
                  <span className="sr-only">Share Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                    <Pencil className="mr-2.5 size-4" />
                    Rename Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash className="mr-2.5 size-4" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
