import { withTransaction } from "../db/transaction";
import { APIError } from "../error";

export namespace Artifact {
  export async function get(id: string) {
    const message = await withTransaction(
      async (tx) =>
        await tx.query.messages.findFirst({
          columns: {
            content: true,
          },
          where: (message, { and, eq }) =>
            and(eq(message.id, id), eq(message.role, "assistant")),
        }),
    );
    if (!message || !message.content) {
      throw APIError.notFound();
    }
    return parse(message.content);
  }

  function parse(input: string): RegistryItem {
    const artifact = extractArtifact(input);
    if (!artifact) {
      throw APIError.notFound();
    }
    const { dependencies, registryDependencies, content } = transformContent(
      artifact.content,
    );
    return {
      name: artifact.title,
      type: "registry:block",
      dependencies,
      registryDependencies,
      files: [
        {
          path: `${artifact.identifier}.${artifact.type}`,
          content,
          type: "registry:component",
        },
      ],
    };
  }

  function transformContent(content: string) {
    const dependencies: string[] = [];
    const registryDependencies: string[] = [];
    for (const dependency of content.matchAll(
      /^import .+ from ("|')(?<path>[^"']+)("|');?$/gm,
    )) {
      if (!dependency.groups?.path) {
        continue;
      }
      const path = dependency.groups.path;
      if (path.startsWith("~/")) {
        registryDependencies.push(path.split("/").pop()!);
      } else if (path !== "react") {
        dependencies.push(path);
      }
    }
    return {
      dependencies,
      registryDependencies,
      content: `"use client";\n${content.replaceAll("~/", "@/")}`,
    };
  }

  function extractArtifact(content: string) {
    const regex =
      /<Artifact\s+title="([^"]+)"\s+identifier="([^"]+)"\s+type="([^"]+)">([\s\S]*?)(<\/Artifact>|$)/;
    const match = regex.exec(content);
    if (!match || !match[1] || !match[2] || !match[3] || !match[4]) {
      return undefined;
    }
    return {
      title: match[1],
      identifier: match[2],
      type: match[3],
      content: match[4],
    };
  }
}

type RegistryItemType =
  | "registry:style"
  | "registry:lib"
  | "registry:example"
  | "registry:block"
  | "registry:component"
  | "registry:ui"
  | "registry:hook"
  | "registry:theme"
  | "registry:page";

type RegistryItemFile = {
  path: string;
  content?: string;
  type: RegistryItemType;
  target?: string;
};

type RegistryItem = {
  name: string;
  type: RegistryItemType;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryItemFile[];
  meta?: Record<string, unknown>;
  docs?: string;
};
