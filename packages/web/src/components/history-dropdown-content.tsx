import { MoreHorizontal, Pencil, Search, Share, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Chat } from "@project-4/core/types";

import { DialogDeleteChat } from "~/components/dialog-delete-chat";
import { DialogRenameChat } from "~/components/dialog-rename-chat";
import { DialogShareChat } from "~/components/dialog-share-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { useListChatsQuery } from "~/lib/api";

export function HistoryDropdownContent() {
  const [shareId, setShareId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useListChatsQuery();

  useEffect(() => {
    if (
      error &&
      !(typeof error === "object" && "status" in error && error.status === 401)
    ) {
      const id = toast.error("Failed to load chat history");
      return () => {
        toast.dismiss(id);
      };
    }
  }, [error]);

  return (
    <>
      <DialogShareChat
        open={!!shareId}
        setOpen={(open) => setShareId(open ? shareId : null)}
        chatId={shareId}
      />
      <DialogRenameChat
        open={!!renameId}
        setOpen={(open) => setRenameId(open ? renameId : null)}
        chatId={renameId}
      />
      <DialogDeleteChat
        open={!!deleteId}
        setOpen={(open) => setDeleteId(open ? deleteId : null)}
        chatId={deleteId}
      />

      <DropdownMenuContent className="w-72" side="right">
        <div className="flex items-center p-1">
          <Search className="size-4 text-muted-foreground" />
          <Input
            className="-m-1 border-none shadow-none focus-visible:ring-0"
            placeholder="Search"
          />
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-3 py-2">Loading...</div>
        ) : (
          data?.map((chat) => (
            <ChatHistoryItem
              key={chat.id}
              chat={chat}
              onShare={() => setShareId(chat.id)}
              onRename={() => setRenameId(chat.id)}
              onDelete={() => setDeleteId(chat.id)}
            />
          ))
        )}
      </DropdownMenuContent>
    </>
  );
}

function ChatHistoryItem({
  chat,
  onShare,
  onRename,
  onDelete,
}: {
  chat: Chat;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenuItem
      key={chat.id}
      className="flex items-center justify-between px-3 py-2"
      asChild
    >
      <Link to={`/${chat.id}`}>
        <span className="flex-1">{chat.title ?? "Untitled Chat"}</span>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onShare();
              }}
            >
              <Share className="mr-2.5 size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onRename();
              }}
            >
              <Pencil className="mr-2.5 size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash className="mr-2.5 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
    </DropdownMenuItem>
  );
}
