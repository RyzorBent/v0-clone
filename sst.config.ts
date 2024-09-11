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
    const { web } = await import("./infra/web");

    return {
      web: web.url,
    };
  },
});
