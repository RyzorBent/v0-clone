import { createContext } from "./context";
import { APIError } from "./error";

export interface UserActor {
  type: "user";
  userId: string;
}

export interface PublicActor {
  type: "public";
}

export const Actor = createContext<UserActor | PublicActor>().extend({
  useUser() {
    const actor = this.use();
    if (actor.type === "user") {
      return actor;
    }
    throw APIError.unauthorized();
  },
});
