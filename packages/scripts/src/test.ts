// import OpenAI from "openai";
// import { Resource } from "sst";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { generateEmbeddings } from "./lib/embeddings";
import { AI } from "@project-4/core/ai";

// const openai = new OpenAI({
//   apiKey: Resource.OPENAI_API_KEY.value,
// });

// const pinecone = new Pinecone({
//   apiKey: Resource.PINECONE_API_KEY.value,
// });
// const index = pinecone.index("shadcn-components");

// const [embedding] = await generateEmbeddings(["<Accordion />"]);

// const query = await index.query({
//   vector: embedding,
//   topK: 10,
//   includeMetadata: true,
// });

// console.log(query.matches);

const res = AI.generateResponseInternal([
  {
    role: "user",
    content:
      "Build a multi-step wizard to collect information on users when onboarding onto a SaaS product.",
  },
]);
while (true) {
  const { value, done } = await res.next();
  if ("message" in value) {
    console.dir(
      {
        ...value,
        message: {
          ...value.message,
          content: value.message.content?.slice(0, 100),
        },
      },
      { depth: null },
    );
  } else {
    console.dir({ ...value }, { depth: null });
  }
  if (done) {
    const { content, artifacts } = AI.extractArtifacts(value.content as string);
    console.log({ content, artifacts });
    break;
  }
}
// console.dir(
//   messages.map((m) => ({
//     ...m,
//     content: m.role === "tool" ? m.content.slice(0, 100) : m.content,
//   })),
//   { depth: null }
// );
