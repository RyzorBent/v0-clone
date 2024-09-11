export const db = new sst.Secret("DATABASE_URL");
export const github = [
  new sst.Secret("GITHUB_CLIENT_ID"),
  new sst.Secret("GITHUB_CLIENT_SECRET"),
];
