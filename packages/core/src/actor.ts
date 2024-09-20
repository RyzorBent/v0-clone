import { AsyncLocalStorage } from "async_hooks";

const storage = new AsyncLocalStorage<{
  userId: string;
}>();

export const Actor = {
  use() {
    const actor = storage.getStore();
    if (!actor) {
      throw new Error("Actor not found");
    }
    return actor;
  },
  async with<T>(userId: string, callback: () => Promise<T>) {
    return await storage.run({ userId }, callback);
  },
};
