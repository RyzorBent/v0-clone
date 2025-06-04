export declare namespace Artifact {
    function get(id: string): Promise<RegistryItem>;
}
type RegistryItemType = "registry:style" | "registry:lib" | "registry:example" | "registry:block" | "registry:component" | "registry:ui" | "registry:hook" | "registry:theme" | "registry:page";
type RegistryItemFile = {
    path: string;
    content?: string;
    type: RegistryItemType;
    target?: string;
};
type RegistryItem = {
    name: string;
    type: RegistryItemType;
    description?: string;
    dependencies?: string[];
    devDependencies?: string[];
    registryDependencies?: string[];
    files?: RegistryItemFile[];
    meta?: Record<string, unknown>;
    docs?: string;
};
export {};
//# sourceMappingURL=index.d.ts.map