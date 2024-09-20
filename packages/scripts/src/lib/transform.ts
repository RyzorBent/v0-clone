import components from "../../templates/components.json";

export const transformCode = (code: string) => {
  return code
    .replace(/"use client"\n\n/g, "")
    .replace(/@\/lib\/utils/, components.aliases.utils)
    .replace(/@\/components\/ui/g, components.aliases.ui)
    .replace(/@\/hooks/g, components.aliases.hooks)
    .replace(/@\/registry\/[^/]+\/ui/g, components.aliases.ui)
    .replace(/@\/registry\/[^/]+/g, components.aliases.ui)
    .replace(/import ({ )?Link( })? from "next\/link"\n/g, "")
    .replace(/<Link([^>]*)>/g, "<a$1>")
    .replace(/<\/Link>/g, "</a>")
    .replace(/import Image from "next\/image"\n/g, "")
    .replace(/<Image([^>]*)>/g, "<img$1>")
    .replace(/<\/Image>/g, "</img>");
};
