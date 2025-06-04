import { secrets } from "./secrets";

export const realtime = new sst.aws.Realtime("Realtime", {
  authorizer: {
    handler: "packages/functions/src/realtime/authorizer.handler",
    link: [secrets.ClerkIssuer, secrets.ClerkPublishableKey],
  },
});
