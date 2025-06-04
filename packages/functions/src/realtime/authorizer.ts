import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

import { authorize } from "../authorize";
import { APIError } from "@project-4-v0/core/error";

export const handler = realtime.authorizer(async (token) => {
  try {
    const actor = await authorize(token);
    
    if (actor.type !== "user") {
      console.log("Unauthorized: Not a user actor", { actor });
      throw new Error("Unauthorized: Not a user actor");
    }

    // Create a topic pattern that allows this user to access their own resources
    const topic = `${Resource.App.name}/${Resource.App.stage}/${actor.userId}/*`;
    
    console.log("Authorized realtime connection successfully", { 
      userId: actor.userId,
      topic,
      time: new Date().toISOString()
    });

    return {
      publish: [topic],
      subscribe: [topic],
    };
  } catch (error) {
    console.error("Realtime authorization failed", { 
      error: error instanceof Error ? error.message : "Unknown error",
      token: token ? `${token.substring(0, 20)}...` : "none",
      time: new Date().toISOString()
    });
    
    if (error instanceof APIError && error.status === 401) {
      throw new Error("Unauthorized: Invalid token");
    }
    
    throw error;
  }
});
