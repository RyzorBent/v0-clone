import { AsyncLocalStorage } from "node:async_hooks";

interface ExtendedContextMethods<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (this: Context<T>, ...args: any[]) => any;
}

interface Context<T> {
  get(): T | undefined;
  use(): T;
  with<R>(value: T, fn: () => R): R;
  extend<U extends ExtendedContextMethods<T>>(
    extendedMethods: U,
  ): Context<T> & U;
}

export function createContext<T>() {
  const storage = new AsyncLocalStorage<T>();
  const methods: Context<T> = {
    get() {
      return storage.getStore();
    },
    use() {
      const result = storage.getStore();
      if (!result) {
        throw new Error("No context available");
      }
      return result;
    },
    with<R>(value: T, fn: () => R) {
      return storage.run<R>(value, fn);
    },
    extend<U extends ExtendedContextMethods<T>>(extendedMethods: U) {
      return {
        ...methods,
        ...extendedMethods,
      };
    },
  };
  return methods;
}
