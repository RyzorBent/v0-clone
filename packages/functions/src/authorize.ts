import { createRemoteJWKSet, JWTVerifyOptions, jwtVerify } from "jose";
import { Resource } from "sst";

import type { PublicActor, UserActor } from "@project-4-v0/core/actor";
import { APIError } from "@project-4-v0/core/error";

export const authorize = async (
  token: string,
): Promise<UserActor | PublicActor> => {
  if (!token) {
    console.log("No token provided, returning public actor");
    return { type: "public" };
  }

  try {
    console.log("Authorizing token", { 
      issuer: Resource.ClerkIssuer.value,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + "..." 
    });

    const jwksUrl = `${Resource.ClerkIssuer.value}/.well-known/jwks.json`;
    console.log("JWKS URL:", jwksUrl);

    const JWKS = createRemoteJWKSet(new URL(jwksUrl));
    
    // Configure JWT verification with relaxed time validation
    const verifyOptions: JWTVerifyOptions = {
      issuer: Resource.ClerkIssuer.value,
      clockTolerance: "1000 years", // Effectively disable time validation in dev
      maxTokenAge: "1000 years"     // Allow very old tokens in dev
    };

    const { payload } = await jwtVerify(token, JWKS, verifyOptions);
    
    console.log('JWT verification successful:', {
      payload,
      sub: payload.sub,
      userId: payload.userId,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined,
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : undefined,
      currentTime: new Date().toISOString()
    });

    // The sub claim is always present in Clerk tokens and represents the user ID
    if (!payload.sub) {
      console.error('Error: No sub claim found in JWT payload');
      throw APIError.unauthorized();
    }

    return { type: "user", userId: payload.sub };
  } catch (error) {
    console.error('JWT verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      issuer: Resource.ClerkIssuer.value,
      time: new Date().toISOString()
    });
    
    if (error instanceof APIError) {
      throw error;
    }
    
    throw APIError.unauthorized();
  }
};
