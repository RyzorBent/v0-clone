export const secrets = {
  ClerkIssuer: new sst.Secret("ClerkIssuer"),
  ClerkJWKSEndpoint: new sst.Secret("ClerkJWKSEndpoint"),
  ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
  ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
  DatabaseURL: new sst.Secret("DatabaseURL"),
  OpenAIAPIKey: new sst.Secret("OpenAIAPIKey"),
};

export const allSecrets = Object.values(secrets);
