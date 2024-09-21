import { Loader2 } from "lucide-react";

import { Button, ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={disabled || loading}>
      <Loader2
        className={cn(
          "size-4 transition-all",
          loading ? "mr-1.5 animate-spin opacity-100" : "mr-0 w-0 opacity-0",
        )}
      />
      {props.children}
    </Button>
  );
}
