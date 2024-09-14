import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useRef, useState } from "react";

import editor from "~/lib/editor.json";
import { useArtifactCode, useChatId } from "./hooks";

const DEFAULT_CODE = `import { Button } from "~/components/ui/button";

export default function App() {
  return <Button>Hello World</Button>;
}`;

export function Editor() {
  const id = useChatId();
  const { code, isSuccess } = useInitialArtifactCode();

  if (!isSuccess) return null;

  return (
    <SandpackProvider
      id={id}
      template="vite-react-ts"
      customSetup={{
        dependencies: editor.dependencies,
        devDependencies: editor.devDependencies,
      }}
      files={{
        "App.tsx": code ?? DEFAULT_CODE,
        ...editor.files,
      }}
    >
      <SandpackLayout className="flex h-screen flex-col">
        <ArtifactCodeHandler />
        <SandpackPreview />
        <SandpackCodeEditor />
      </SandpackLayout>
    </SandpackProvider>
  );
}

const useInitialArtifactCode = () => {
  const { code, isSuccess } = useArtifactCode();
  const [initialArtifact, setInitialArtifact] = useState(code);

  useEffect(() => {
    if (!isSuccess) {
      setInitialArtifact(null);
    } else if (code && !initialArtifact) {
      setInitialArtifact(code);
    }
  }, [code, initialArtifact, isSuccess]);

  return useMemo(
    () => ({
      code: initialArtifact,
      isSuccess,
    }),
    [initialArtifact, isSuccess],
  );
};

function ArtifactCodeHandler() {
  const { code } = useArtifactCode();
  const { sandpack } = useSandpack();

  const currentCodeRef = useRef(code);
  const sandpackRef = useRef(sandpack);

  useEffect(() => {
    const newCode = code ?? DEFAULT_CODE;
    if (newCode !== currentCodeRef.current) {
      sandpackRef.current.updateFile("App.tsx", newCode, true);
      currentCodeRef.current = newCode;
    }
  }, [code]);

  return null;
}
