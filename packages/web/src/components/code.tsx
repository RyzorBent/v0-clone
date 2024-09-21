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
    <SyntaxHighlighter language="tsx" style={style} showLineNumbers wrapLines>
      {children}
    </SyntaxHighlighter>
  );
}

const useIsDarkMode = () => {
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  return useSyncExternalStore(
    (callback) => {
      darkModeMediaQuery.addEventListener("change", callback);
      return () => {
        darkModeMediaQuery.removeEventListener("change", callback);
      };
    },
    () => darkModeMediaQuery.matches,
    () => darkModeMediaQuery.matches,
  );
};
