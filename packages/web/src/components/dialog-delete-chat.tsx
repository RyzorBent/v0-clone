import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useDeleteChatMutation } from "~/lib/api";
import { activeChatChanged } from "~/lib/state";
import { useAppDispatch, useAppSelector } from "~/lib/store";
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

interface DialogDeleteChatProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chatId: string | null;
}

export function DialogDeleteChat({
  chatId,
  open,
  setOpen,
}: DialogDeleteChatProps) {
  const [deleteChat, { isLoading }] = useDeleteChatMutation();
  const activeChatId = useAppSelector(({ state }) => state.chatId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>
            This chat will be deleted and removed from your history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={async (e) => {
              e.preventDefault();

              if (!chatId) return;

              const result = await deleteChat(chatId);
              if (result.error) {
                toast.error("Something went wrong. Please try again.");
              } else {
                setOpen(false);
                if (activeChatId === chatId) {
                  dispatch(activeChatChanged(null));
                  navigate("/");
                }
                toast.success("Chat deleted successfully.");
              }
            }}
            loading={isLoading}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
