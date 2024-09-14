import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";

SyntaxHighlighter.registerLanguage("tsx", tsx);

export function Code({ children = "" }: { children?: string }) {
  return (
    <SyntaxHighlighter
      language="tsx"
      style={coy}
      customStyle={{
        backgroundColor: "var(--background)",
      }}
      showLineNumbers
      wrapLines
    >
      {children}
    </SyntaxHighlighter>
  );
}
