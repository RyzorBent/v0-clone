import { writeFile } from "node:fs/promises";

import { fetchComponentDocumentation } from "./lib/docs";
import { fetchRegistryIndex } from "./lib/registry";

const components = await fetchRegistryIndex();

const docs = await Promise.all(
  components.map(async (component) => {
    const doc = await fetchComponentDocumentation(component.name);
    return [doc.title, doc];
  }),
);

await writeFile(
  "../core/src/ai/knowledge-base.json",
  JSON.stringify(Object.fromEntries(docs), null, 2) + "\n",
);
