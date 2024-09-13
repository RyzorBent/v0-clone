import { UserButton } from "@clerk/remix";
import type { schema } from "@project-4/core/db";
import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { Ellipsis, Loader2, Trash } from "lucide-react";
import { useChats, useCreateChat, useDeleteChat } from "~/api/hooks";
import { api } from "~/api/server";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { withHydrationBoundary } from "~/lib/with-hydration-boundary";

export const loader = async (args: LoaderFunctionArgs) => {
  return await api(args).prefetch((api) => api.query("/chats"));
};

export default withHydrationBoundary(function Chats() {
  const chats = useChats();
  const createChat = useCreateChat();

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col justify-between border-r bg-muted p-4">
        <ul className="flex w-full flex-col items-stretch gap-1">
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </ul>
        <div className="flex flex-row gap-2">
          <Button
            className="w-full"
            type="submit"
            disabled={createChat.isPending}
            size="sm"
            onClick={() => createChat.mutate()}
          >
            New Chat
          </Button>
          <UserButton />
        </div>
      </aside>
      <Outlet />
    </div>
  );
});

function ChatItem({ chat }: { chat: SerializeFrom<schema.Chat> }) {
  const deleteChat = useDeleteChat();

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
    >
      {({ isPending, isTransitioning }) => (
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
                    deleteChat.mutate(chat.id);
                  }}
                  disabled={deleteChat.isPending}
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
