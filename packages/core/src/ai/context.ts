import { promisify } from "util";
import { gunzip } from "zlib";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import { Resource } from "sst";
import { secrets } from "@project-4-v0/infra/secrets";

const openai = new OpenAI({
  apiKey: secrets.OpenAIAPIKey.value,
});
const pinecone = new Pinecone({
  apiKey: secrets.PineconeAPIKey.value,
});
const shadcnIndex = pinecone.index("shadcn");
const gunzipPromise = promisify(gunzip);

export type ComponentContext = {
  components: { id: string; content: string; score?: number }[];
  blocks: { id: string; content: string; score?: number }[];
};

export async function retrieveComponentContext(
  query: string,
): Promise<ComponentContext> {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });
  const vector = embedding.data[0].embedding;
  const [components, blocks] = await Promise.all([
    shadcnIndex
      .namespace("component")
      .query({
        vector,
        topK: 10,
        includeMetadata: true,
      })
      .then(parseQueryResponse),
    shadcnIndex
      .namespace("block")
      .query({
        vector,
        topK: 2,
        includeMetadata: true,
      })
      .then(parseQueryResponse),
  ]);
  return {
    components,
    blocks,
  };
}

async function parseQueryResponse(response: { matches: Array<{ id: string; score?: number; metadata?: Record<string, unknown> }> }) {
  const matches = await Promise.all(
    response.matches.map(async (match) => {
      const content = match.metadata?.content;
      const buffer = Buffer.from(content as string, "base64");
      const unzipped = await gunzipPromise(buffer);
      return {
        id: match.id,
        content: unzipped.toString("utf-8"),
        score: match.score,
      };
    }),
  );
  return matches;
}
