import { z } from "zod";
import { fetchText } from "./fetch";
import { fetchRegistryExample } from "./registry";
import { STYLE } from "../constants";
import { transformCode } from "./transform";

export const fetchComponentDocumentation = async (
  component: string
): Promise<{
  title: string;
  description: string;
  documentation: string;
}> => {
  const url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/content/docs/components/${component}.mdx`;
  const text = await fetchText(url);

  const title = text.match(/title: (.*)/)![1];
  const description = text.match(/description: (.*)/)![1];

  const previewComponents: { name: string; description?: string }[] = [];

  let textWithPreviews = text.replaceAll(
    /<ComponentPreview[^/]+\/>/g,
    (match) => {
      const name = match.match(/name="(.*?)"/)?.[1];
      const description = match.match(/description="(.*?)"/)?.[1];
      if (name) {
        previewComponents.push({ name, description });
        return `PREVIEW:${name}`;
      }
      return "";
    }
  );

  for (const preview of previewComponents) {
    const code = await fetchRegistryExample(STYLE, preview.name);
    textWithPreviews = textWithPreviews.replace(
      `PREVIEW:${preview.name}`,
      `
        <ComponentPreview name="${preview.name}" description="${preview.description}">
          ${code}
        </ComponentPreview>
      `
    );
  }

  return { title, description, documentation: transformCode(textWithPreviews) };
};
