import { createContext } from "./context.js";
import { APIError } from "./error.js";

export interface UserActor {
  type: "user";
  userId: string;
}

export interface PublicActor {
  type: "public";
}

export const Actor = createContext<UserActor | PublicActor>().extend({
  useUser() {
    console.log("Getting user actor from context");
    const actor = this.use();
    console.log("Current actor:", actor);
    if (actor.type === "user") {
      return actor;
    }
    console.error("Unauthorized: Actor is not a user", { actor });
    throw APIError.unauthorized();
  },
});
