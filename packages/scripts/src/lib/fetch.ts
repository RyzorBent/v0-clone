import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const CACHE_DIR = join(process.cwd(), "node_modules", ".cache/fetch");

export async function fetchJSON<T>(url: string): Promise<T> {
  const text = await fetchText(url);
  return JSON.parse(text) as T;
}

export async function fetchText(url: string): Promise<string> {
  const key = createHash("sha256").update(url).digest("hex");
  const cachePath = join(CACHE_DIR, `${key}.json`);

  try {
    const cachedData = await readFile(cachePath, "utf-8");
    const { data } = JSON.parse(cachedData) as {
      url: string;
      data: string | null;
    };
    if (data === null) {
      throw new Error(`Failed to fetch ${url}: Not Found`);
    }
    return data;
  } catch {
    throw new Error("cache miss");
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        await writeFile(
          cachePath,
          JSON.stringify({ url, data: null }),
          "utf-8"
        );
      }
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    const data = await res.text();

    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath, JSON.stringify({ url, data }), "utf-8");

    return data;
  }
}
