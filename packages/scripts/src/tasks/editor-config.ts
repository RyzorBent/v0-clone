import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

import basePackageJson from "../../templates/package.json";
import { resolveDependency } from "../api/npm";
import {
  getRegistryBaseColor,
  getRegistryIndex,
  getRegistryItem,
} from "../api/registry";
import { registryIndexSchema } from "../api/registry/schema";
import {
  transformComponentPath,
  transformComponentSource,
} from "../helpers/transform";

const config = await buildEditorConfig();
const output = resolve(process.cwd(), "../web/src/lib/editor.json");
writeFileSync(output, JSON.stringify(config, null, 2));

async function buildEditorConfig() {
  const index = await getRegistryIndex();
  const dependencies = await resolvePackageDependencies(index);
  const files = await resolveComponentFiles(index);
  const styles = await resolveStyles();

  const builtPackageJson = {
    ...basePackageJson,
    dependencies: {
      ...basePackageJson.dependencies,
      ...dependencies,
    },
  };

  return {
    dependencies: builtPackageJson.dependencies,
    devDependencies: builtPackageJson.devDependencies,
    files: {
      "package.json": JSON.stringify(builtPackageJson, null, 2),
      "components.json": readFileSync("./templates/components.json", "utf-8"),
      "tailwind.config.js": readFileSync(
        "./templates/tailwind.config.js",
        "utf-8",
      ),
      "postcss.config.js": readFileSync(
        "./templates/postcss.config.js",
        "utf-8",
      ),
      "tsconfig.json": readFileSync("./templates/tsconfig.json", "utf-8"),
      "vite.config.ts": readFileSync("./templates/vite.config.ts", "utf-8"),
      "styles.css": styles,
      "src/lib/utils.ts": readFileSync("./templates/utils.ts", "utf-8"),
      ...files,
    },
  };
}

async function resolveComponentFiles(
  index: z.infer<typeof registryIndexSchema>,
) {
  const files: Record<string, string> = {};
  await Promise.all(
    index.map(async (component) => {
      const item = await getRegistryItem("default", component.name);
      for (const file of item.files ?? []) {
        const path = transformComponentPath(file).replace("~/", "src/");
        const content = transformComponentSource(file.content!);
        files[path] = content;
      }
    }),
  );
  return files;
}

async function resolvePackageDependencies(
  index: z.infer<typeof registryIndexSchema>,
) {
  const dependencies = new Set([
    "tailwindcss-animate",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ]);
  for (const component of index) {
    for (const dependency of component.dependencies ?? []) {
      dependencies.add(dependency);
    }
  }
  const resolvedDependencies = await Promise.all(
    Array.from(dependencies)
      .sort()
      .map(async (dependency) => {
        const { name, version } = await resolveDependency(dependency);
        return [name, version];
      }),
  );

  return Object.fromEntries(resolvedDependencies);
}

async function resolveStyles() {
  const baseColor = await getRegistryBaseColor("neutral");
  return baseColor.cssVarsTemplate;
}
