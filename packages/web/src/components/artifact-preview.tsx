import { Code2, Loader2 } from "lucide-react";

import { artifactOpenChanged } from "~/lib/state";
import { useAppDispatch, useAppSelector } from "~/lib/store";

export function ArtifactPreview({
  title,
  isComplete,
}: {
  title: string;
  isComplete: boolean;
}) {
  const isOpen = useAppSelector(({ state }) => state.isArtifactOpen);
  const dispatch = useAppDispatch();
  return (
    <button
      className="my-2 flex w-72 items-center gap-4 rounded-md border bg-muted px-4 py-3"
      onClick={() => {
        dispatch(artifactOpenChanged(!isOpen));
      }}
    >
      {isComplete ? (
        <Code2 className="size-5" />
      ) : (
        <Loader2 className="size-5 animate-spin" />
      )}
      <div className="flex flex-col items-start text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {isOpen ? "Click to close" : "Click to open"}
        </p>
      </div>
    </button>
  );
}
