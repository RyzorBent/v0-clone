import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import style from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";

SyntaxHighlighter.registerLanguage("tsx", tsx);

export function Code({ children = "" }: { children?: string }) {
  return (
    <SyntaxHighlighter
      language="tsx"
      style={style}
      customStyle={{
        backgroundColor: "var(--secondary)",
        color: "var(--secondary-foreground)",
      }}
      showLineNumbers
      wrapLines
    >
      {children}
    </SyntaxHighlighter>
  );
}
