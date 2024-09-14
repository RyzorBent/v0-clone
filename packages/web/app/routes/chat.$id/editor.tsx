import { lazy, Suspense } from "react";

import { Code } from "~/components/code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useArtifact, useChatId } from "./hooks";

const Sandpack = lazy(() => import("~/components/sandpack"));

export function Editor() {
  const id = useChatId();
  const { artifact } = useArtifact();

  return (
    <Tabs
      className="flex h-screen w-full flex-col bg-muted"
      defaultValue="code"
    >
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent className="relative flex-1" value="preview">
        {artifact ? (
          <Suspense fallback={<div>Loading...</div>}>
            <Sandpack key={id} code={artifact.content} />
          </Suspense>
        ) : (
          <div>No artifact found</div>
        )}
      </TabsContent>
      <TabsContent className="h-full overflow-scroll" value="code">
        <Code>{artifact?.content}</Code>
      </TabsContent>
    </Tabs>
  );
}
