/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
    app(input) {
        const stage = input.stage ?? "dev";
        return {
            name: "project-4-v0",
            stage,
            removal: "retain",
            region: "us-east-1",
            home: "aws",
            dev: {
                deploy: true,
                live: true,
                // Increase timeouts for Windows
                deployTimeout: 60 * 5, // 5 minutes
            },
            providers: { aws: "6.81.0" },
        };
    },
    console: {
        autodeploy: {
            target(event) {
                if (event.type === "branch" &&
                    event.branch === "main" &&
                    event.action === "pushed") {
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
