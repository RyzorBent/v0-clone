import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";

export async function withCache<T>(
  fn: () => Promise<T>,
  { namespace, key }: { namespace: string; key: string },
): Promise<T> {
  const path = join(
    process.cwd(),
    "node_modules",
    ".cache",
    namespace,
    key.endsWith(".json") ? key : `${key}.json`,
  );

  try {
    const { data } = JSON.parse(await readFile(path, "utf-8")) as {
      data: T;
    };
    return data;
  } catch {
    const result: T = await fn();
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify({ data: result }), "utf-8");
    return result;
  }
}

export function cache<I extends any[], O>(
  {
    namespace,
  }: {
    namespace: string;
  },
  fn: (...input: I) => Promise<O>,
): (...input: I) => Promise<O> {
  const directory = join(process.cwd(), "node_modules", ".cache", namespace);

  return async (...input: I): Promise<O> => {
    const key = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
    const path = join(directory, key);

    try {
      const { data } = JSON.parse(await readFile(path, "utf-8")) as {
        data: O;
      };
      return data;
    } catch {
      const result: O = await fn(...input);
      await mkdir(directory, { recursive: true });
      await writeFile(path, JSON.stringify({ data: result }), "utf-8");
      return result;
    }
  };
}
