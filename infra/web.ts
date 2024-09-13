import { api } from "./api";
import { dns } from "./dns";
import { realtime } from "./realtime";
import { clerk } from "./secrets";

export const web = new sst.aws.Remix("Web", {
  path: "packages/web",
  link: [api, realtime],
  environment: {
    CLERK_PUBLISHABLE_KEY: clerk.publishableKey.value,
    CLERK_SECRET_KEY: clerk.secretKey.value,
    CLERK_SIGN_IN_URL: "/sign-in",
    CLERK_SIGN_UP_URL: "/sign-up",
    CLERK_SIGN_IN_FALLBACK_URL: "/",
    CLERK_SIGN_UP_FALLBACK_URL: "/",
  },
  domain:
    $app.stage === "production"
      ? {
          name: "project-4.headstarter.tech",
          dns,
        }
      : undefined,
  warm: $app.stage === "production" ? 1 : 0,
  dev: {
    url: "http://localhost:5173",
  },
});
