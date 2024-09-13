import { z } from "zod";
import { fetchJSON, fetchText } from "./fetch";

const REGISTRY_BASE_URL = "https://ui.shadcn.com/registry";

export const fetchRegistryIndex = async (): Promise<RegistryIndexItem[]> => {
  const url = `${REGISTRY_BASE_URL}/index.json`;
  const data = await fetchJSON(url);
  return z.array(RegistryIndexItem).parse(data);
};

export const RegistryIndexItem = z.object({
  name: z.string(),
  dependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(z.string()),
  type: z.literal("components:ui"),
});
export type RegistryIndexItem = z.infer<typeof RegistryIndexItem>;

export const fetchRegistryStyles = async (): Promise<RegistryStyle[]> => {
  const url = `${REGISTRY_BASE_URL}/styles/index.json`;
  const data = await fetchJSON(url);
  return z.array(RegistryStyle).parse(data);
};

export const fetchRegistryBaseColors = async (): Promise<RegistryStyle[]> => {
  return [
    {
      name: "neutral",
      label: "Neutral",
    },
    {
      name: "gray",
      label: "Gray",
    },
    {
      name: "zinc",
      label: "Zinc",
    },
    {
      name: "stone",
      label: "Stone",
    },
    {
      name: "slate",
      label: "Slate",
    },
  ];
};

export const RegistryStyle = z.object({
  name: z.string(),
  label: z.string(),
});
export type RegistryStyle = z.infer<typeof RegistryStyle>;

export const fetchRegistryBaseColor = async (
  color: string
): Promise<RegistryBaseColor> => {
  const url = `${REGISTRY_BASE_URL}/colors/${color}.json`;
  const data = await fetchJSON(url);
  return RegistryBaseColor.parse(data);
};

export const RegistryBaseColor = z.object({
  inlineColors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVars: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  inlineColorsTemplate: z.string(),
  cssVarsTemplate: z.string(),
});
export type RegistryBaseColor = z.infer<typeof RegistryBaseColor>;

export const fetchRegistryComponent = async (
  style: string,
  name: string
): Promise<RegistryComponent> => {
  const url = `${REGISTRY_BASE_URL}/styles/${style}/${name}.json`;
  const data = await fetchJSON(url);
  return RegistryComponent.parse(data);
};

export const RegistryFile = z.object({
  name: z.string(),
  content: z.string(),
});
export type RegistryFile = z.infer<typeof RegistryFile>;

export const RegistryComponent = z.object({
  name: z.string(),
  dependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(RegistryFile),
  type: z.literal("components:ui"),
});
export type RegistryComponent = z.infer<typeof RegistryComponent>;

export const fetchRegistryExample = async (
  style: string,
  name: string
): Promise<string> => {
  const internalRegistry = await fetchCompleteInternalRegistry();
  const registryItem = internalRegistry[style]?.[name];
  if (!registryItem) {
    throw new Error(`Registry item not found: ${style}/${name}`);
  }
  let subdirectory: string | undefined;
  if (registryItem.type === "registry:example") {
    subdirectory = "example";
  } else if (registryItem.type === "registry:block") {
    subdirectory = "block";
  } else {
    throw new Error(
      `Registry item has no subdirectory: ${style}/${name} (${registryItem.type})`
    );
  }
  const url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/${style}/${subdirectory}/${name}.tsx`;
  return await fetchText(url);
};

export const InternalRegistry = z.record(
  z.string(),
  z.record(
    z.string(),
    z.object({
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
      registryDependencies: z.array(z.string()).optional(),
      files: z.array(z.string()),
      source: z.string(),
      category: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
      ),
      subcategory: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
      ),
      chunks: z.array(z.any()),
    })
  )
);
export type InternalRegistry = z.infer<typeof InternalRegistry>;

let internalRegistry: InternalRegistry | undefined;

const fetchCompleteInternalRegistry = async () => {
  if (internalRegistry) {
    return internalRegistry;
  }
  const text = await fetchText(
    "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/__registry__/index.tsx"
  );
  const content = text
    .match(/export const Index: Record<string, any> = ({[\s\S]+})/)?.[1]
    .replaceAll(/\s*component:[\s\S]+?,\n?/g, "");
  const registry = eval(`(${content})`);
  internalRegistry = InternalRegistry.parse(registry);
  return internalRegistry;
};
