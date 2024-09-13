import { generateChatTitleQueue, generateMessageResponseQueue } from "./queue";
import { realtime } from "./realtime";
import { db, clerk } from "./secrets";

const routes = {
  "GET /chats": "packages/functions/src/routes/chat.index",
  "GET /chats/{id}": "packages/functions/src/routes/chat.get",
  "POST /chats": "packages/functions/src/routes/chat.create",
  "GET /chats/{id}/messages": "packages/functions/src/routes/messages.index",
  "POST /chats/{id}/messages": "packages/functions/src/routes/messages.create",
  "DELETE /chats/{id}": "packages/functions/src/routes/chat.del",
};

export const api = new sst.aws.ApiGatewayV2("API", {
  cors: {
    allowCredentials: true,
    allowOrigins: [
      $app.stage === "production"
        ? "https://project-4.headstarter.tech"
        : "http://localhost:5173",
    ],
  },
  transform: {
    route: {
      handler: {
        link: [
          db,
          realtime,
          generateMessageResponseQueue,
          generateChatTitleQueue,
        ],
      },
    },
  },
});

const authorizer = api.addAuthorizer({
  name: "clerk",
  jwt: {
    issuer: clerk.issuer.value,
    audiences: ["project-4-v0"],
  },
});

for (const [route, handler] of Object.entries(routes)) {
  api.route(route, handler, {
    auth: {
      jwt: {
        authorizer: authorizer.id,
      },
    },
  });
}
