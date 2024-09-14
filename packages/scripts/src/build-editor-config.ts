import { readFile, writeFile } from "node:fs/promises";
import { resolvePackageDependency } from "./lib/npm";
import {
  fetchRegistryBaseColor,
  fetchRegistryComponent,
  fetchRegistryIndex,
} from "./lib/registry";
import { transformCode } from "./lib/transform";
import { BASE_COLOR, STYLE } from "./constants";

const dependencies = new Set<string>([
  "tailwindcss-animate",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
]);
const components = new Set<string>();

const index = await fetchRegistryIndex();

for (const component of index) {
  components.add(component.name);
  for (const dependency of component.dependencies ?? []) {
    dependencies.add(dependency);
  }
}

const [resolvedDependencies, resolvedComponents, resolvedBaseColor] =
  await Promise.all([
    Promise.all(Array.from(dependencies).map(resolvePackageDependency)),
    Promise.all(
      Array.from(components).map((component) =>
        fetchRegistryComponent(STYLE, component)
      )
    ),
    fetchRegistryBaseColor(BASE_COLOR),
  ]);

const builtPackageJson = JSON.parse(
  await readFile("./templates/package.json", "utf-8")
) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
builtPackageJson.dependencies = {
  ...builtPackageJson.dependencies,
  ...Object.fromEntries(resolvedDependencies.map((d) => [d.name, d.version])),
};
const builtComponents = resolvedComponents
  .flatMap((c) => c.files)
  .map((file) => ({
    path: `src/components/ui/${file.name}`,
    content: transformCode(file.content),
  }));

const builtConfig = {
  dependencies: builtPackageJson.dependencies,
  devDependencies: builtPackageJson.devDependencies,
  files: {
    "package.json": JSON.stringify(builtPackageJson, null, 2),
    "components.json": await readFile("./templates/components.json", "utf-8"),
    "tailwind.config.js": await readFile(
      "./templates/tailwind.config.js",
      "utf-8"
    ),
    "postcss.config.js": await readFile(
      "./templates/postcss.config.js",
      "utf-8"
    ),
    "tsconfig.json": await readFile("./templates/tsconfig.json", "utf-8"),
    "vite.config.ts": await readFile("./templates/vite.config.ts", "utf-8"),
    "styles.css": resolvedBaseColor.cssVarsTemplate,
    "src/lib/utils.ts": await readFile("./templates/utils.ts", "utf-8"),
    ...Object.fromEntries(
      builtComponents.map(({ path, content }) => [path, content])
    ),
  },
};

await writeFile(
  "../web/app/lib/editor.json",
  JSON.stringify(builtConfig, null, 2) + "\n"
);
