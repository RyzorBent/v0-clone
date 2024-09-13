import { MessagesAPI } from "@project-4/core/messages";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export const index = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const chatId = event.pathParameters!.id!;
  const messages = await MessagesAPI.list(chatId);
  return {
    statusCode: 200,
    body: JSON.stringify(messages),
  };
};

export const create = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  try {
    const chatId = event.pathParameters!.id!;
    const { content } = JSON.parse(event.body!) as { content: string };
    const message = await MessagesAPI.create({
      role: "user",
      content,
      chatId,
    });
    return {
      statusCode: 201,
      body: JSON.stringify(message),
    };
  } catch (error) {
    const e = error instanceof Error ? error : new Error(JSON.stringify(error));
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e.message }),
    };
  }
};
