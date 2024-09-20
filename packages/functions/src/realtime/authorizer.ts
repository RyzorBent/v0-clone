import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";
import { authorize } from "../authorize";

export const handler = realtime.authorizer(async (token) => {
  const userId = await authorize(token);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return {
    principalId: Date.now().toString(),
    publish: [`${Resource.App.name}/${Resource.App.stage}/${userId}/*`],
    subscribe: [`${Resource.App.name}/${Resource.App.stage}/${userId}/*`],
  };
});
