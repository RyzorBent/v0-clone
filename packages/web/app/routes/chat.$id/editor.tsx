import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

import editor from "~/lib/editor.json";
import { useArtifacts } from "./hooks";

const DEFAULT_CODE = `import { Button } from "~/components/ui/button";

export default function App() {
  return <Button>Hello World</Button>;
}`;

export function Editor() {
  const artifacts = useArtifacts();

  const code = artifacts?.[artifacts.length - 1]?.content ?? DEFAULT_CODE;
  console.log("artifacts", artifacts);

  return (
    <SandpackProvider
      template="vite-react-ts"
      customSetup={{
        dependencies: editor.dependencies,
        devDependencies: editor.devDependencies,
      }}
      files={{
        "App.tsx": code,
        ...editor.files,
      }}
    >
      <SandpackLayout className="flex h-screen flex-col">
        <SandpackPreview />
        <SandpackCodeEditor />
      </SandpackLayout>
    </SandpackProvider>
  );
}
