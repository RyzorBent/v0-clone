import { promisify } from "util";
import { gzip } from "zlib";
import { Pinecone } from "@pinecone-database/pinecone";
import { Resource } from "sst";
import { z } from "zod";

import {
  fetchComponentDocumentation,
  fetchInternalFile,
  fetchInternalRegistryIndex,
  internalRegistryItemSchema,
} from "../api/github";
import { generateEmbedding, generateFileDescription } from "../api/openai";
import { getRegistryIndex } from "../api/registry";
import {
  extractBlockDescription,
  transformComponentSource,
  transformRegistrySource,
} from "../helpers/transform";

const pc = new Pinecone({
  apiKey: Resource.PineconeAPIKey.value,
});

const [components, examples] = await Promise.all([
  resolveComponents(),
  resolveExamples(),
]);

for (const item of [...examples, ...components]) {
  console.time(`Process "${item.id}"`);
  const embedding = await generateEmbedding(item.content.slice(0, 8192));
  const compressedContent = await promisify(gzip)(item.content);
  const index = pc.index("shadcn");
  const namespace = index.namespace("default");
  await namespace.upsert([
    {
      id: item.id,
      values: embedding,
      metadata: {
        ...item.metadata,
        content: compressedContent.toString("base64"),
      },
    },
  ]);
  console.timeEnd(`Process "${item.id}"`);
}

async function resolveComponents() {
  const index = await getRegistryIndex();
  return await Promise.all(
    index.map((component) => resolveComponentDocumentation(component.name)),
  );
}

async function resolveComponentDocumentation(name: string) {
  const doc = await fetchComponentDocumentation(name);

  const description = doc.match(/description: (.*)/)![1];

  const usage =
    name === "chart" || name === "form"
      ? doc.split("---")[1]
      : transformComponentSource(
          doc
            .match(/(## Usage[\s\S]*?)($|##)/)?.[1]
            ?.replace(/```\n\n```tsx/g, "")
            .trim() ?? "",
        );

  return {
    id: `component:${name}`,
    content: [
      `name: ${name}`,
      `description: ${description}`,
      `type: "component"`,
      "---",
      usage,
    ].join("\n\n"),
    metadata: {
      name: name,
      type: "component",
    },
  };
}

async function resolveExamples() {
  const index = await fetchInternalRegistryIndex();
  return await Promise.all(
    Object.values(index.default!)
      .filter(
        (entry) =>
          entry.type === "registry:block" || entry.type === "registry:example",
      )
      .map((block) => resolveExample(block)),
  );
}

async function resolveExample({
  name,
  registryDependencies,
  files,
  chunks,
  category,
  subcategory,
  type,
}: z.infer<typeof internalRegistryItemSchema>) {
  const filesExcludingChunks = files.filter(
    (file) => !chunks.some((chunk) => chunk.file === file),
  );
  const resolvedFiles = await Promise.all(
    filesExcludingChunks.map((file) => resolveBlockFile(file)),
  );
  const resolvedChunks = await Promise.all(
    chunks.map((chunk) => resolveBlockChunk(chunk)),
  );
  const formattedFiles = [...resolvedFiles, ...resolvedChunks]
    .map(formatFile)
    .join("\n\n");

  const formattedType = type.replace("registry:", "");

  return {
    id: `${formattedType}:${name}`,
    metadata: {
      name: name,
      type: formattedType,
      category: category,
      subcategory: subcategory,
      registryDependencies: registryDependencies,
    },
    content: [
      `name: ${name}`,
      `type: "${formattedType}"`,
      `category: ${category}`,
      subcategory && `subcategory: ${subcategory}`,
      registryDependencies &&
        `shadcn/ui components used: ${registryDependencies.join(", ")}`,
      "---",
      formattedFiles,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function resolveBlockFile(path: string) {
  const rawContent = await fetchInternalFile(path);

  const name = path.split("/").pop()!;
  const content = transformRegistrySource(rawContent);
  const description =
    extractBlockDescription(rawContent) ??
    (await generateFileDescription(name, content));

  return {
    name,
    description,
    content: transformRegistrySource(rawContent),
  };
}

async function resolveBlockChunk({
  name,
  description,
  file,
}: {
  name: string;
  description: string;
  file: string;
}) {
  return {
    name,
    description,
    content: transformRegistrySource(await fetchInternalFile(file)),
  };
}

function formatFile(file: {
  name: string;
  description: string;
  content: string;
}) {
  return [
    "/**",
    ` * @file ${file.name}`,
    ` * @description ${file.description}`,
    " */",
    file.content,
  ].join("\n");
}
