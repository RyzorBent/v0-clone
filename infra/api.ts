import { generateMessageResponseQueue } from "./queue";
import { realtime } from "./realtime";
import { allSecrets } from "./secrets";

export const api = new sst.aws.Function("API", {
  handler: "packages/functions/src/api/index.handler",
  link: [...allSecrets, generateMessageResponseQueue, realtime],
  runtime: "nodejs20.x",
  nodejs: {
    esbuild: {
      external: [
        '@aws-sdk/client-sqs',
        '@aws-sdk/client-iot-data-plane',
        '@pinecone-database/pinecone',
        'node-fetch',
        'agentkeepalive',
        'abort-controller',
        'formdata-node',
        'form-data-encoder',
        'openai'
      ],
      minify: false
    }
  },
  permissions: [
    {
      actions: ["iot:*"],
      resources: ["*"],
    },
  ],
  url: {
    cors: {
      allowCredentials: true,
      allowOrigins: [
        $app.stage === "production"
          ? "https://v0.headstarter.tech"
          : ["http://localhost:5173", "http://localhost:5174"],
      ].flat(),
    },
  },
});
