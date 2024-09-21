import { UserButton } from "@clerk/clerk-react";
import { Code2, History, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useCreateChatMutation } from "~/lib/api";
import { activeChatChanged } from "~/lib/state";
import { useAppDispatch } from "~/lib/store";
import { HistoryDropdownContent } from "./history-dropdown-content";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function Sidebar() {
  const [createChat, { isLoading }] = useCreateChatMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-14 flex-col items-center justify-between border-r bg-secondary p-4">
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/" className="mb-1 rounded-full bg-primary p-2">
                <Code2 className="size-5 text-primary-foreground" />
                <span className="sr-only">v0</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">v0</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="dark:text-foreground"
                variant="outline"
                size="icon"
                onClick={async () => {
                  const result = await createChat();
                  if (result.data) {
                    dispatch(activeChatChanged(result.data.id));
                    navigate(`/${result.data.id}`);
                  } else {
                    toast.error("Failed to create chat");
                  }
                }}
                disabled={isLoading}
              >
                <Plus className="size-4" />
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Chat</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="text-muted-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <History className="size-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">History</TooltipContent>
            </Tooltip>
            <HistoryDropdownContent />
          </DropdownMenu>
        </div>
        <UserButton />
      </div>
    </TooltipProvider>
  );
}
