import { createRemoteJWKSet, jwtVerify } from "jose";
import { Resource } from "sst";

import type { PublicActor, UserActor } from "@project-4/core/actor";

export const authorize = async (
  token: string,
): Promise<UserActor | PublicActor> => {
  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(
        new URL(`${Resource.ClerkIssuer.value}/.well-known/jwks.json`),
      ),
      {
        audience: ["v0-clone", "authenticated"],
        issuer: Resource.ClerkIssuer.value,
      },
    );
    return { type: "user", userId: payload.sub! };
  } catch {
    return { type: "public" };
  }
};
