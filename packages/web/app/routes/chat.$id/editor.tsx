import { Code2, Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

import { Code } from "~/components/code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { useArtifact, useChatId } from "./hooks";

const Sandpack = lazy(() => import("~/components/sandpack"));

export function Editor() {
  const id = useChatId();
  const { artifact } = useArtifact();
  const [tab, setTab] = useState<"preview" | "code">("code");
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  useEffect(() => {
    if (artifact?.isComplete) {
      setTab("preview");
    } else {
      setTab("code");
    }
  }, [artifact?.isComplete]);

  return (
    <Tabs
      className="flex h-screen w-full flex-col bg-muted"
      value={tab}
      onValueChange={(value) => setTab(value as "preview" | "code")}
    >
      <TabsList className="mt-2">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <div className="dark relative m-2 flex flex-1 flex-col overflow-scroll rounded-lg border border-secondary bg-secondary p-0 text-secondary-foreground">
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
            <SandpackLoading className="absolute inset-0 z-50 bg-secondary" />
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
