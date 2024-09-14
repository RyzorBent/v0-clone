import { Pinecone } from "@pinecone-database/pinecone";
import { Resource } from "sst";
import { STYLE } from "./constants";
import { fetchComponentDocumentation } from "./lib/docs";
import { generateEmbeddings } from "./lib/embeddings";
import { fetchRegistryExample, fetchRegistryIndex } from "./lib/registry";
import { transformCode } from "./lib/transform";
import { writeFile } from "node:fs/promises";

const pinecone = new Pinecone({
  apiKey: Resource.PINECONE_API_KEY.value,
});
const index = pinecone.index("shadcn-components");

const components = await fetchRegistryIndex();

const docs = await Promise.all(
  components.map(async (component) => {
    const doc = await fetchComponentDocumentation(component.name);
    return [doc.title, doc];
  })
);

await writeFile(
  "../core/src/ai/knowledge-base.json",
  JSON.stringify(Object.fromEntries(docs), null, 2)
);

// for (const doc of docs) {
//   console.log(`Processing ${doc.slug}`);
//   const sections = [
//     { text: doc.title, metadata: { type: "title" } },
//     { text: doc.description, metadata: { type: "description" } },
//     { text: doc.usage, metadata: { type: "usage" } },
//     ...doc.previews.map((preview) => ({
//       text: JSON.stringify(preview),
//       metadata: { type: "preview", name: preview.name },
//     })),
//   ];
//   const embeddings = await generateEmbeddings(
//     sections.map((section) => section.text)
//   );

//   const vectors = sections.map((section, index) => ({
//     id: [
//       doc.slug,
//       section.metadata.type,
//       "name" in section.metadata ? section.metadata.name : null,
//     ]
//       .filter(Boolean)
//       .join(":"),
//     values: embeddings[index],
//     metadata: {
//       component: doc.slug,
//       text: section.text,
//       ...section.metadata,
//     },
//   }));
//   await index.upsert(vectors);
// }

await writeFile("knowledge-base.json", JSON.stringify(docs, null, 2));
