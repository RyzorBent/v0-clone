import { z } from "zod";

import { withCache } from "../helpers/cache";

export const internalRegistryItemSchema = z.object({
  name: z.string(),
  type: z.enum([
    "registry:style",
    "registry:lib",
    "registry:example",
    "registry:block",
    "registry:component",
    "registry:ui",
    "registry:hook",
    "registry:theme",
    "registry:page",
  ]),
  registryDependencies: z
    .array(z.string())
    .optional()
    .transform((files) =>
      Array.isArray(files) && files.length > 0 ? files : undefined,
    ),
  files: z.array(z.string()),
  source: z.string(),
  category: z.preprocess(
    (val) => (val === "undefined" ? undefined : val),
    z.string().optional(),
  ),
  subcategory: z.preprocess(
    (val) => (val === "undefined" ? undefined : val),
    z.string().optional(),
  ),
  chunks: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      file: z.string(),
    }),
  ),
});

const internalRegistryIndexSchema = z.record(
  z.string(),
  z.record(z.string(), internalRegistryItemSchema),
);

export async function fetchInternalRegistryIndex() {
  return await withCache(
    async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/__registry__/index.tsx",
      );
      const text = await res.text();
      const content = text
        .match(/export const Index: Record<string, any> = ({[\s\S]+})/)?.[1]
        .replaceAll(/\s*component:[\s\S]+?,\n?/g, "");
      const registry = eval(`(${content})`);
      return internalRegistryIndexSchema.parse(registry);
    },
    { namespace: "shadcn-github", key: "index" },
  );
}

export async function fetchInternalFile(path: string) {
  return await withCache(
    async () => {
      const res = await fetch(
        `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/${path}`,
      );
      return await res.text();
    },
    { namespace: "shadcn-github", key: path },
  );
}

export async function fetchComponentDocumentation(name: string) {
  return await fetchInternalFile(`content/docs/components/${name}.mdx`);
}
