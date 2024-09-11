/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "project-4-v0",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  console: {
    autodeploy: {
      target(event) {
        if (
          event.type === "branch" &&
          event.branch === "main" &&
          event.action === "pushed"
        ) {
          return {
            stage: "production",
            runner: {
              engine: "codebuild",
              compute: "large",
            },
          };
        }
      },
    },
  },
  async run() {
    const secrets = {
      db: new sst.Secret("DATABASE_URL"),
      github: [
        new sst.Secret("GITHUB_CLIENT_ID"),
        new sst.Secret("GITHUB_CLIENT_SECRET"),
      ],
    };
    const web = new sst.aws.Nextjs("Web", {
      link: [secrets.db, ...secrets.github],
      domain:
        $app.stage === "production"
          ? {
              name: "project-4.headstarter.tech",
              dns: sst.cloudflare.dns({
                zone: "7a5502a3f47bd7135d313edb536abfbe",
              }),
            }
          : undefined,
      warm: $app.stage === "production" ? 1 : 0,
    });
    return {
      web: web.url,
    };
  },
});
