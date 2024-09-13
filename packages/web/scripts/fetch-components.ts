import { writeFile } from "node:fs/promises";
import type { z } from "zod";
import {
  registryBaseColorSchema,
  registryIndexSchema,
  type registryItemFileSchema,
  registryItemSchema,
} from "./schema";
import {
  COMPONENTS_JSON,
  PACKAGE_JSON,
  POSTCSS_CONFIG_JS,
  TAILWIND_CONFIG_JS,
  TSCONFIG_JSON,
  VITE_CONFIG_TS,
} from "./templates";
import { fetchJSON, fetchText } from "./utils";

const COMPONENT_REGISTRY_BASE_URL = "https://ui.shadcn.com/r";

const fetchRegistryIndex = async () => {
  const data = await fetchJSON(`${COMPONENT_REGISTRY_BASE_URL}/index.json`);
  return registryIndexSchema.parse(data);
};

const fetchRegistryStyle = async () => {
  const data = await fetchJSON(
    `${COMPONENT_REGISTRY_BASE_URL}/styles/${COMPONENTS_JSON.style}/index.json`,
  );
  return registryItemSchema.parse(data);
};

const fetchRegistryBaseColor = async () => {
  const data = await fetchJSON(
    `${COMPONENT_REGISTRY_BASE_URL}/colors/${COMPONENTS_JSON.tailwind.baseColor}.json`,
  );
  return registryBaseColorSchema.parse(data);
};

const fetchRegistryComponent = async (name: string) => {
  const data = await fetchJSON(
    `${COMPONENT_REGISTRY_BASE_URL}/styles/${COMPONENTS_JSON.style}/${name}.json`,
  );
  return registryItemSchema.parse(data);
};

const transformFile = (file: z.infer<typeof registryItemFileSchema>) => {
  if (!file.path || !file.content) return file;
  return {
    ...file,
    path: file.path.startsWith("lib")
      ? file.path.replace("lib", COMPONENTS_JSON.aliases.lib)
      : file.path.replace(/[^/]+/, COMPONENTS_JSON.aliases.ui),
    content: file.content
      .replace(/@\/lib\/utils/, COMPONENTS_JSON.aliases.utils)
      .replace(/@\/registry\/[^/]+\/ui/, COMPONENTS_JSON.aliases.ui)
      .replace(/@\/registry\/[^/]+/, COMPONENTS_JSON.aliases.ui),
  };
};

const resolveComponentFiles = async (component: string) => {
  const data = await fetchRegistryComponent(component);
  return (data.files?.map(transformFile) ?? []).map((file) => ({
    path: file.path,
    content: file.content!,
  }));
};

const resolveComponentDocumentation = async (component: string) => {
  const url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/content/docs/components/${component}.mdx`;
  return await fetchText(url);
};

const resolvePackageDependencies = async (
  names: Set<string>,
): Promise<Record<string, string>> => {
  const dependencies = await Promise.all(
    Array.from(new Set(names))
      .flat()
      .sort()
      .map(async (packageName) => {
        const { name, version } = await resolvePackage(packageName);
        return [name, version];
      }),
  );
  return Object.fromEntries(dependencies) as Record<string, string>;
};

const resolvePackage = async (
  packageName: string,
): Promise<{ name: string; version: string }> => {
  const parsed = /^(.[^@]+)@?(\d+\.\d+\.\d+)?$/.exec(packageName);
  if (!parsed) {
    throw new Error(`Invalid package name: ${packageName}`);
  }
  const name = parsed[1];
  const version = parsed[2];
  if (name && version) {
    return { name, version };
  }
  return await fetchJSON<{ name: string; version: string }>(
    `https://registry.npmjs.org/${name}/latest`,
  );
};

const prepareTemplate = async () => {
  const [index, style] = await Promise.all([
    fetchRegistryIndex(),
    fetchRegistryStyle(),
  ]);

  const dependencies = new Set<string>([
    "tailwindcss-animate",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ]);
  const devDependencies = new Set<string>([]);
  const registryDependencies = new Set<string>();
  const components = new Set<string>();

  for (const component of [style, ...index]) {
    if (component.type === "registry:ui") {
      components.add(component.name);
    }
    for (const dependency of component.dependencies ?? []) {
      dependencies.add(dependency);
    }
    for (const devDependency of component.devDependencies ?? []) {
      devDependencies.add(devDependency);
    }
    for (const registryDependency of component.registryDependencies ?? []) {
      registryDependencies.add(registryDependency);
    }
  }

  const resolvedFiles = await Promise.all(
    Array.from([...registryDependencies, ...components]).map(
      async (component) => {
        return await resolveComponentFiles(component);
      },
    ),
  );

  const packageJson = {
    ...PACKAGE_JSON,
    dependencies: {
      ...PACKAGE_JSON.dependencies,
      ...(await resolvePackageDependencies(dependencies)),
    },
    devDependencies: {
      ...PACKAGE_JSON.devDependencies,
      ...(await resolvePackageDependencies(devDependencies)),
    },
  };

  const template = {
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "components.json": JSON.stringify(COMPONENTS_JSON, null, 2),
      "tailwind.config.js": TAILWIND_CONFIG_JS,
      "postcss.config.js": POSTCSS_CONFIG_JS,
      "tsconfig.json": JSON.stringify(TSCONFIG_JSON, null, 2),
      "vite.config.ts": VITE_CONFIG_TS,
      "styles.css": (await fetchRegistryBaseColor()).cssVarsTemplate,
      ...Object.fromEntries(
        resolvedFiles
          .flat()
          .map(({ path, content }) => [path.replace("~/", "src/"), content]),
      ),
    },
  };

  await writeFile("./app/lib/editor.json", JSON.stringify(template, null, 2));

  const docs = await Promise.all(
    Array.from(components).map(async (component) => {
      const files = await resolveComponentFiles(component);
      const content = await resolveComponentDocumentation(component);
      return { name: component, files, content };
    }),
  );
  await writeFile("./app/lib/docs.json", JSON.stringify(docs, null, 2));
};

await prepareTemplate();
