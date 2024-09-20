/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "project-4-v0",
      removal: "remove",
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
    const { api } = await import("./infra/api");
    const { web } = await import("./infra/web");

    return {
      api: api.url,
      web: web.url,
    };
  },
});
