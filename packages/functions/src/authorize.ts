import { createRemoteJWKSet, jwtVerify } from "jose";
import { Resource } from "sst";

export const authorize = async (token: string) => {
  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(new URL(Resource.ClerkJWKSEndpoint.value)),
      {
        audience: ["headstarter-projects-lambda"],
        issuer: Resource.ClerkIssuer.value,
      }
    );
    return payload.sub;
  } catch (error) {
    return null;
  }
};
