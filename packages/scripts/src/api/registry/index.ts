import { z } from "zod";

import { withCache } from "../../helpers/cache";
import {
  registryBaseColorSchema,
  registryIndexSchema,
  registryItemSchema,
} from "./schema";

export async function getRegistryIndex() {
  return await fetchRegistry("index.json", registryIndexSchema);
}

export async function getRegistryItem(style: string, name: string) {
  return await fetchRegistry(
    `styles/${style}/${name}.json`,
    registryItemSchema,
  );
}

export async function getRegistryBaseColor(baseColor: string) {
  return await fetchRegistry(
    `colors/${baseColor}.json`,
    registryBaseColorSchema,
  );
}

async function fetchRegistry<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  return await withCache(
    async () => {
      const res = await fetch(`https://ui.shadcn.com/r/${path}`);
      return schema.parse(await res.json());
    },
    { namespace: "registry", key: path },
  );
}
