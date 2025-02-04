import { createHash } from "crypto";
import { OpenAI } from "openai";
import { Resource } from "sst";

import { withCache } from "../helpers/cache";

const openai = new OpenAI({
  apiKey: Resource.OpenAIAPIKey.value,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  return await withCache(
    async () => {
      const res = await openai.embeddings.create({
        input: text,
        model: "text-embedding-3-large",
      });
      return res.data[0].embedding;
    },
    {
      namespace: "openai/embeddings",
      key: createHash("sha256").update(text).digest("hex"),
    },
  );
}

export async function generateFileDescription(
  name: string,
  content: string,
): Promise<string> {
  return await withCache(
    async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'You are an expert frontend React engineer and UI/UX designer. Please generate a concise description for the following file. For example: "A card showing a list of recent sales with customer names and email addresses." It is very important to keep your description concise and to the point, focusing on what the file does rather than how it does it. Your description should ideally be a single sentence, but if you must, you can use two sentences.',
          },
          {
            role: "user",
            content: `File name: ${name}\n\nFile content: ${content}`,
          },
        ],
        response_format: { type: "text" },
      });

      const description = response.choices[0].message.content;
      if (!description) {
        throw new Error("Failed to generate file description");
      }
      return description;
    },
    {
      namespace: "openai/file-descriptions",
      key: name,
    },
  );
}
