export const secrets = {
    ClerkIssuer: new sst.Secret("ClerkIssuer"),
    ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
    DatabaseURL: new sst.Secret("DatabaseURL"),
    OpenAIAPIKey: new sst.Secret("OpenAIAPIKey"),
    PineconeAPIKey: new sst.Secret("PineconeAPIKey"),
};
export const allSecrets = Object.values(secrets);
