import { pgTableCreator, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
/**
 * This uses the multi-table schema feature in Drizzle.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const defineTable = pgTableCreator((name) => `p4_${name}`);
export const column = {
    nanoid: (name) => {
        return varchar(name, { length: 21 });
    },
    id: (name) => {
        return column
            .nanoid(name)
            .$defaultFn(() => nanoid())
            .primaryKey();
    },
};
//# sourceMappingURL=utils.js.map