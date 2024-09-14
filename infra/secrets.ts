export const clerk = {
  publishableKey: new sst.Secret("CLERK_PUBLISHABLE_KEY"),
  secretKey: new sst.Secret("CLERK_SECRET_KEY"),
  issuer: new sst.Secret("CLERK_ISSUER"),
};
export const db = new sst.Secret("DATABASE_URL");
export const openai = new sst.Secret("OPENAI_API_KEY");
