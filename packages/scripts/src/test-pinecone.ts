import { promisify } from "util";
import { gunzip } from "zlib";
import { Pinecone } from "@pinecone-database/pinecone";
import { Resource } from "sst";
import { secrets } from "../../../infra/secrets";

import { generateEmbedding } from "./api/openai";

const gunzipAsync = promisify(gunzip);

const pc = new Pinecone({
  apiKey: secrets.PineconeAPIKey.value,
});

const index = pc.index("shadcn");
const namespace = index.namespace("default");

const queryInput =
  "Build a login form with a username and password input field, a submit button, and a label for the username input field.";

const embedding = await generateEmbedding(queryInput.slice(0, 8192));

const res = await namespace.query({
  vector: embedding,
  topK: 5,
  includeMetadata: true,
});
const matches = await Promise.all(
  res.matches.map(async (match) => {
    const metadata = match.metadata as Record<string, unknown>;
    const content = Buffer.from(metadata.content as string, "base64");
    const decompressedData = await gunzipAsync(content);
    const decompressedText = decompressedData.toString("utf8");
    return {
      ...metadata,
      content: decompressedText.slice(0, 100),
    };
  }),
);

console.log(matches);
