"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import editor from "~/lib/editor.json";

export function Editor() {
  return (
    <SandpackProvider
      template="vite-react-ts"
      customSetup={{
        dependencies: editor.dependencies,
        devDependencies: editor.devDependencies,
      }}
      files={{
        "App.tsx": [
          `import { Button } from "~/components/ui/button";`,
          ``,
          `export default function App() {`,
          `  return <Button>Hello World</Button>`,
          `}`,
          ``,
        ].join("\n"),
        ...editor.files,
      }}
    >
      <SandpackLayout>
        <SandpackPreview />
        <SandpackCodeEditor />
      </SandpackLayout>
    </SandpackProvider>
  );
}
