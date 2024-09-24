import { z } from "zod";

import components from "../../templates/components.json";
import { registryItemFileSchema } from "../api/registry/schema";

export const transformComponentPath = ({
  path,
  type,
}: z.infer<typeof registryItemFileSchema>) => {
  const registryType = type.split(":")[1];
  if (registryType === "ui") {
    return path.replace("ui", components.aliases.ui);
  } else if (registryType === "hook") {
    return path.replace("hooks", components.aliases.hooks);
  } else {
    throw new Error(`Unknown registry type: ${type}`);
  }
};

export const transformComponentSource = (code: string) => {
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

export const transformRegistrySource = (code: string) => {
  return transformComponentSource(code)
    .replace(
      /import\s+{[^}]+}\s+from\s+"@\/registry\/[^/]+\/block\/[^/]+\/[^/]+\/[^"]+";?\n?/g,
      "",
    )
    .replace(
      /\n?export const (containerClassName|iframeHeight|description) =\s?\n?\s*"([^"]+)"\n?\n?/g,
      "",
    )
    .replace(
      `export default async function Page() {\n  const { cookies } = await import("next/headers")\n  return (\n    <SidebarLayout\n      defaultOpen={cookies().get("sidebar:state")?.value === "true"}`,
      "export default function Page() {\n  return (\n    <SidebarLayout\n      defaultOpen={true}",
    );
};

export const extractBlockDescription = (code: string) => {
  const match = code.match(
    /\n?export const description =\s?\n?\s*"([^"]+)"\n?\n?/s,
  );
  return match ? match[1] : undefined;
};
