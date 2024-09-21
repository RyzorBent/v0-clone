import { useSyncExternalStore } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import darkStyle from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";
import lightStyle from "react-syntax-highlighter/dist/cjs/styles/prism/one-light";

SyntaxHighlighter.registerLanguage("tsx", tsx);

export function Code({ children = "" }: { children?: string }) {
  const isDarkMode = useIsDarkMode();
  const style = isDarkMode ? darkStyle : lightStyle;

  return (
    <SyntaxHighlighter
      language="tsx"
      style={{
        ...style,
        'pre[class*="language-"]': {
          ...style['pre[class*="language-"]'],
          background: "transparent",
        },
        'code[class*="language-"]': {
          ...style['code[class*="language-"]'],
          background: "transparent",
        },
      }}
      customStyle={{
        flex: 1,
      }}
      showLineNumbers
      wrapLines
    >
      {children}
    </SyntaxHighlighter>
  );
}

const useIsDarkMode = () => {
  return useSyncExternalStore(
    (callback) => {
      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
  );
};
