import { Check, Code2, Copy, Loader2, Terminal } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

import { Code } from "~/components/code";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useArtifact, useChatId } from "~/lib/hooks";
import { artifactOpenChanged } from "~/lib/state";
import { useAppDispatch } from "~/lib/store";
import { cn } from "~/lib/utils";

const Sandpack = lazy(() => import("~/components/sandpack"));

export function ArtifactContent() {
  const id = useChatId();
  const { artifact, messageId } = useArtifact();
  const [tab, setTab] = useState<"preview" | "code">("code");
  const dispatch = useAppDispatch();
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  useEffect(() => {
    if (artifact) {
      dispatch(artifactOpenChanged(true));
      if (artifact.isComplete) {
        setTab("preview");
      } else {
        setTab("code");
      }
    }
  }, [artifact?.isComplete, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tabs
      className="flex h-screen w-full flex-col"
      value={tab}
      onValueChange={(value) => setTab(value as "preview" | "code")}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        {messageId && (
          <AddToCodebase
            messageId={messageId}
            disabled={!artifact?.isComplete}
          />
        )}
      </div>
      <div className="relative m-2 flex flex-1 flex-col overflow-scroll rounded-lg border border-secondary bg-secondary p-0 text-secondary-foreground">
        <TabsContent className="relative mt-0 flex-1 p-0" value="preview">
          {artifact ? (
            <Suspense fallback={<SandpackLoading />}>
              <Sandpack
                key={id}
                code={artifact.content}
                onStatusChange={(status) => {
                  if (status === "done") {
                    setIsPreviewReady(true);
                  }
                }}
              />
            </Suspense>
          ) : (
            <EmptyView message="When v0 generates code, you’ll be able to preview it here." />
          )}
          {!isPreviewReady && (
            <SandpackLoading className="absolute inset-0 z-20 bg-secondary" />
          )}
        </TabsContent>
        <TabsContent className="mt-0 h-full" value="code">
          {artifact ? (
            <Code>{artifact.content}</Code>
          ) : (
            <EmptyView message="When v0 generates code, you’ll be able to see it here." />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

function AddToCodebase({
  messageId,
  disabled,
}: {
  messageId: string;
  disabled: boolean;
}) {
  const command = `npx shadcn add "${import.meta.env.VITE_API_URL}components/${messageId}/json"`;
  const [copied, setCopied] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" disabled={disabled}>
                <Terminal className="size-4" />
                <span className="sr-only">Add to codebase</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2 pb-2">
              <h2 className="text-lg font-semibold">Add to codebase</h2>
              <p className="text-sm text-muted-foreground">
                Run this command to add the component to your codebase.
              </p>
              <Button
                className="px-3"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(command);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
              >
                <span className="flex-0 overflow-hidden text-ellipsis font-mono">
                  {command}
                </span>
                <span className="ml-1 size-4 flex-1">
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent className="z-50">Add to Codebase</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SandpackLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyView({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Code2 className="size-10" />
      <p>{message}</p>
    </div>
  );
}
