import { z } from "zod";
import { fetchText } from "./fetch";

export const Doc = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  links: z
    .object({
      doc: z.string(),
      api: z.string(),
    })
    .optional(),
  previews: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
  usage: z.string(),
});
export type Doc = z.infer<typeof Doc>;

export const fetchComponentDocumentation = async (
  component: string
): Promise<Doc> => {
  const url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/content/docs/components/${component}.mdx`;
  const text = await fetchText(url).catch(() => {
    const url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/content/docs/components/blocks/${component}.mdx`;
    return fetchText(url);
  });

  const title = text.match(/title: (.*)/)?.[1];
  const description = text.match(/description: (.*)/)?.[1];
  const doc = text.match(/doc: (.*)/)?.[1];
  const api = text.match(/api: (.*)/)?.[1];

  const previewComponentsWithProps = text.matchAll(/ComponentPreview[^/]+/g);
  const previews = Array.from(previewComponentsWithProps).map((match) => {
    const name = match[0].match(/name="(.*?)"/)?.[1];
    const description = match[0].match(/description="(.*?)"/)?.[1];
    return {
      name,
      description,
    };
  });

  const usage = Array.from(text.matchAll(/```tsx[^\n]*\n([\s\S]*?)\n```/g));
  const importCode = usage[0]?.[1];
  const exampleCode = usage[1]?.[1];

  return Doc.parse({
    slug: component,
    title,
    description,
    links:
      doc && api
        ? {
            doc,
            api,
          }
        : undefined,
    previews,
    usage: [importCode, exampleCode].join("\n\n"),
  });
};
