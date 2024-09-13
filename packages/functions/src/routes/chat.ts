import "@project-4/core/polyfill";

import { ChatAPI } from "@project-4/core/chat";
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export const index = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const chats = await ChatAPI.index(userId);
  return {
    statusCode: 200,
    body: JSON.stringify(chats),
  };
};

export const get = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const chatId = event.pathParameters!.id!;
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const chat = await ChatAPI.get(chatId, userId);
  if (!chat) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Chat not found" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(chat),
  };
};

export const create = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const chat = await ChatAPI.create(userId);
  return {
    statusCode: 201,
    body: JSON.stringify(chat),
  };
};

export const update = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const chatId = event.pathParameters!.id!;
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const input = ChatAPI.UpdateInput.parse(JSON.parse(event.body!));
  await ChatAPI.update(chatId, userId, input);
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};

export const del = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const chatId = event.pathParameters!.id!;
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  await ChatAPI.del(chatId, userId);
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
