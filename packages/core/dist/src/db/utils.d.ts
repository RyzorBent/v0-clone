/**
 * This uses the multi-table schema feature in Drizzle.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export declare const defineTable: import("drizzle-orm/pg-core").PgTableFn<undefined>;
export declare const column: {
    nanoid: <TName extends string>(name: TName) => import("drizzle-orm/pg-core").PgVarcharBuilderInitial<TName, [string, ...string[]]>;
    id: <TName extends string>(name: TName) => import("drizzle-orm").IsPrimaryKey<import("drizzle-orm").NotNull<import("drizzle-orm").HasRuntimeDefault<import("drizzle-orm").HasDefault<import("drizzle-orm/pg-core").PgVarcharBuilderInitial<TName, [string, ...string[]]>>>>>;
};
//# sourceMappingURL=utils.d.ts.map