import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

import editor from "~/lib/editor.json";

const DEFAULT_CODE = `export default function App() {
  return <></>;
}`;

interface SandpackProps {
  code: string | null;
  onStatusChange?: (status: "done") => void;
}

export default function Sandpack({ code, onStatusChange }: SandpackProps) {
  const initialCodeRef = useRef(code ?? DEFAULT_CODE);

  return (
    <SandpackProvider
      template="vite-react-ts"
      customSetup={{
        dependencies: editor.dependencies,
        devDependencies: editor.devDependencies,
      }}
      files={{
        "App.tsx": initialCodeRef.current ?? DEFAULT_CODE,
        ...editor.files,
      }}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <SandpackPreview className="absolute inset-0" />
      <SandpackAPIHandler code={code} onStatusChange={onStatusChange} />
    </SandpackProvider>
  );
}

function SandpackAPIHandler({ code, onStatusChange }: SandpackProps) {
  const { sandpack, listen } = useSandpack();

  const currentCodeRef = useRef(code);
  const sandpackRef = useRef(sandpack);

  useEffect(() => {
    sandpackRef.current = sandpack;
  }, [sandpack]);

  useEffect(() => {
    const newCode = code ?? DEFAULT_CODE;
    if (newCode !== currentCodeRef.current) {
      sandpackRef.current.updateFile("App.tsx", newCode, true);
      currentCodeRef.current = newCode;
    }
  }, [code]);

  useEffect(() => {
    if (onStatusChange) {
      return listen((msg) => {
        console.log(JSON.stringify(msg));
        if (msg.type === "done") {
          onStatusChange("done");
        }
      });
    }
  }, [listen, onStatusChange]);

  return null;
}
