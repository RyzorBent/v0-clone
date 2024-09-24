import { Loader2 } from "lucide-react";

export function Status({
  status,
}: {
  status:
    | "thinking"
    | "planning"
    | "retrieving-context"
    | "generating-component";
}) {
  return (
    <div className="my-2 flex w-72 items-center gap-4 rounded-md border bg-muted px-4 py-3">
      <Loader2 className="size-5 animate-spin" />
      <div className="flex flex-col items-start text-left">
        <p className="text-sm font-medium">
          {status === "thinking"
            ? "Thinking..."
            : status === "planning"
              ? "Planning..."
              : status === "retrieving-context"
                ? "Reading documentation..."
                : "Generating code..."}
        </p>
      </div>
    </div>
  );
}
