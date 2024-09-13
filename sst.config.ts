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
    await import("./infra/secrets");
    await import("./infra/realtime");
    await import("./infra/queue");
    const { web } = await import("./infra/web");
    const { api } = await import("./infra/api");

    return {
      api: api.url,
      web: web.url,
    };
  },
});
