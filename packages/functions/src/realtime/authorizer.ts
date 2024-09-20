import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

import { authorize } from "../authorize";

export const handler = realtime.authorizer(async (token) => {
  const actor = await authorize(token);
  if (actor.type !== "user") {
    throw new Error("Unauthorized");
  }
  const topic = `${Resource.App.name}/${Resource.App.stage}/${actor.userId}/*`;
  return {
    publish: [topic],
    subscribe: [topic],
  };
});
