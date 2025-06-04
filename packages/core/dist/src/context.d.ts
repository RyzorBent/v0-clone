interface ExtendedContextMethods<T> {
    [key: string]: (this: Context<T>, ...args: any[]) => any;
}
interface Context<T> {
    get(): T | undefined;
    use(): T;
    with<R>(value: T, fn: () => R): R;
    extend<U extends ExtendedContextMethods<T>>(extendedMethods: U): Context<T> & U;
}
export declare function createContext<T>(): Context<T>;
export {};
//# sourceMappingURL=context.d.ts.map