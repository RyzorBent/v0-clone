import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { OpenAI } from "openai";
import { Resource } from "sst";

const openai = new OpenAI({
  apiKey: Resource.OpenAIAPIKey.value,
});

const CACHE_DIR = join(process.cwd(), "node_modules", ".cache/embeddings");

export async function generateEmbeddings(text: string[]): Promise<number[][]> {
  const key = createHash("sha256").update(JSON.stringify(text)).digest("hex");
  const cachePath = join(CACHE_DIR, `${key}.json`);

  try {
    const cachedData = await readFile(cachePath, "utf-8");
    const { embeddings } = JSON.parse(cachedData) as {
      text: string;
      embeddings: number[][];
    };
    return embeddings;
  } catch {
    const res = await openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small",
    });
    const embeddings = res.data.map((embedding) => embedding.embedding);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath, JSON.stringify({ text, embeddings }), "utf-8");
    return embeddings;
  }
}
