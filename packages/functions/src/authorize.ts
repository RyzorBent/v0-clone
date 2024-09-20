import { createRemoteJWKSet, jwtVerify } from "jose";
import { Resource } from "sst";

export const authorize = async (token: string) => {
  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(
        new URL(`${Resource.ClerkIssuer.value}/.well-known/jwks.json`)
      ),
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
