import { createContext } from "../context";
import { usePool } from "./pool";
const txContext = createContext();
export async function withTransaction(fn) {
    const tx = txContext.get();
    if (!tx) {
        const db = usePool();
        const result = await db.transaction(async (tx) => {
            return await txContext.with(tx, () => fn(tx));
        });
        return result;
    }
    return await fn(tx);
}
