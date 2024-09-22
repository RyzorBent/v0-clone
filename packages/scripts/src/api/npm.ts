import { z } from "zod";

import { withCache } from "../helpers/cache";

const resolvedDependencySchema = z.object({
  name: z.string(),
  version: z.string(),
});

export async function resolveDependency(packageName: string) {
  return await withCache(
    async () => {
      const parsed = /^(.[^@]+)@?(\d+\.\d+\.\d+)?$/.exec(packageName);
      if (!parsed) {
        throw new Error(`Invalid package name: ${packageName}`);
      }
      const name = parsed[1];
      const version = parsed[2];
      if (name && version) {
        return { name, version };
      }
      const res = await fetch(`https://registry.npmjs.org/${name}/latest`);
      const data = await res.json();
      return resolvedDependencySchema.parse(data);
    },
    { namespace: "npm", key: packageName },
  );
}
