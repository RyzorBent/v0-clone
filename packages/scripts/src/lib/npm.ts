import { fetchJSON } from "./fetch";

export const resolvePackageDependency = async (
  packageName: string
): Promise<{ name: string; version: string }> => {
  const parsed = /^(.[^@]+)@?(\d+\.\d+\.\d+)?$/.exec(packageName);
  if (!parsed) {
    throw new Error(`Invalid package name: ${packageName}`);
  }
  const name = parsed[1];
  const version = parsed[2];
  if (name && version) {
    return { name, version };
  }
  return await fetchJSON<{ name: string; version: string }>(
    `https://registry.npmjs.org/${name}/latest`
  );
};
