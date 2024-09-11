import { db } from "../db";
import { User } from "../db/schema";
import { nanoid } from "nanoid";

export namespace UserAPI {
  export async function findOrCreate(
    githubId: number,
    username: string,
    image: string
  ) {
    return await db.transaction(async (tx) => {
      const existing = await tx.query.User.findFirst({
        columns: { id: true },
        where: (User, { eq }) => eq(User.githubId, githubId),
      });
      if (existing) {
        return existing.id;
      }
      const id = nanoid();
      await tx.insert(User).values({
        id,
        githubId,
        username,
        image,
      });
      return id;
    });
  }
}
