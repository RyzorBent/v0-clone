/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/heading-has-content, jsx-a11y/alt-text */

import { evaluateSync } from "@mdx-js/mdx";
import { Code2 } from "lucide-react";
import React, { useMemo } from "react";

export function Markdown({ children }: { children: string }) {
  return useMemo(() => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < children.split("\n").length; i++) {
      const line = children.split("\n")[i].trim();
      if (!line) continue;
      try {
        const { default: Component } = evaluateSync(line, {
          Fragment: React.Fragment,
          jsx: React.createElement,
          jsxs: React.createElement,
          useMDXComponents: () => components,
        });
        elements.push(<Component key={i} />);
      } catch (error) {
        continue;
      }
    }
    return elements;
  }, [children]);
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-bold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-bold" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-md font-bold" {...props} />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 className="text-sm font-bold" {...props} />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 className="text-xs font-bold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-base" {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-blue-500" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-4" {...props}>
      {props.children}
    </ul>
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-4" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-100 p-1" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-100 p-1" {...props} />
  ),
  img: (props: React.HTMLAttributes<HTMLImageElement>) => (
    <img className="w-full" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-gray-300 pl-4" {...props} />
  ),
  Artifact: ({ title }: { title: string }) => (
    <div className="my-2 flex w-fit items-center rounded-md border bg-muted px-3 py-2">
      <Code2 className="mr-2 size-4" />
      <p className="text-sm font-medium">{title}</p>
    </div>
  ),
};

function transform<T extends React.PropsWithChildren>(
  Component: React.ComponentType<T>,
): React.ComponentType<T> {
  const TransformedComponent = (props: T) => {
    if (
      "children" in props &&
      props.children &&
      Array.isArray(props.children)
    ) {
      if (props.children.length === 1) {
        return <Component {...props}>{props.children[0]}</Component>;
      }
      return (
        <Component {...props}>
          {props.children.map((child, index) => {
            return <React.Fragment key={index}>{child}</React.Fragment>;
          })}
        </Component>
      );
    } else {
      return <Component {...props} />;
    }
  };
  TransformedComponent.displayName = Component.displayName;
  return TransformedComponent;
}

for (const key in components) {
  const Component = components[key as keyof typeof components];
  // @ts-expect-error - TypeScript doesn't like us mutating the components object
  components[key as keyof typeof components] = transform(Component);
}
