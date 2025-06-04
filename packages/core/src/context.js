import { AsyncLocalStorage } from "node:async_hooks";
export function createContext() {
    const storage = new AsyncLocalStorage();
    const methods = {
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
        with(value, fn) {
            return storage.run(value, fn);
        },
        extend(extendedMethods) {
            return {
                ...methods,
                ...extendedMethods,
            };
        },
    };
    return methods;
}
