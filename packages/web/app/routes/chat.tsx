import { UserButton } from "@clerk/remix";
import { NavLink, Outlet, useNavigate } from "@remix-run/react";
import { Ellipsis, Loader2, Trash } from "lucide-react";

import type { Chat } from "@project-4/core/db";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useListChatsQuery,
} from "~/lib/api";
import { useTypedDispatch } from "~/lib/hooks";
import { chatIdChanged } from "~/lib/state";
import { cn } from "~/lib/utils";

export default function Chats() {
  const { data } = useListChatsQuery();
  const [createChat, { isLoading }] = useCreateChatMutation();
  const navigate = useNavigate();
  const dispatch = useTypedDispatch();

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-shrink-0 flex-col justify-between border-r bg-muted p-4">
        <ul className="flex w-full flex-col items-stretch gap-1">
          {data?.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onDelete={(id) => {
                const chat = data?.filter((c) => c.id !== id)?.[0];
                if (chat) {
                  navigate(`/chat/${chat.id}`);
                } else {
                  navigate("/chat");
                }
              }}
            />
          ))}
        </ul>
        <div className="flex flex-row gap-2">
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading}
            size="sm"
            onClick={() => {
              createChat().then((res) => {
                if (!res.data) return;
                dispatch(chatIdChanged(res.data.id));
                navigate(`/chat/${res.data.id}`);
              });
            }}
          >
            New Chat
          </Button>
          <UserButton />
        </div>
      </aside>
      <Outlet />
    </div>
  );
}

function ChatItem({
  chat,
  onDelete,
}: {
  chat: Chat;
  onDelete: (id: string) => void;
}) {
  const [deleteChat, { isLoading }] = useDeleteChatMutation();
  const dispatch = useTypedDispatch();

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "flex items-center justify-between gap-2",
          "hover:bg-primary/5",
          isActive && "bg-primary/10 text-primary",
        )
      }
      to={`/chat/${chat.id}`}
      onClick={() => {
        dispatch(chatIdChanged(chat.id));
      }}
    >
      {({ isActive, isPending, isTransitioning }) => (
        <>
          <span className="max-w-full truncate">
            {chat.title ?? "Untitled"}
          </span>
          {isPending || isTransitioning ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="size-6" size="icon" variant="ghost">
                  <Ellipsis className="size-4 text-muted-foreground/75" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteChat(chat.id);
                    if (isActive) {
                      onDelete(chat.id);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Trash className="mr-1.5 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </NavLink>
  );
}
