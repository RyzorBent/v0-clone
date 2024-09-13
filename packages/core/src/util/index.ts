import "../polyfill";

import type { Context, APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";
import type { Simplify } from "drizzle-orm";

type ZodHandlerSchema = {
  path?: z.AnyZodObject;
  query?: z.AnyZodObject;
  body?: z.AnyZodObject;
};

type ZodHandlerInput<Schema extends ZodHandlerSchema> = {
  [K in keyof Schema]: Schema[K] extends z.AnyZodObject
    ? z.infer<Schema[K]>
    : never;
};

type ZodHandlerParams<Schema extends ZodHandlerSchema> = {
  context: Context;
  event: APIGatewayProxyEvent;
  input: Simplify<ZodHandlerInput<Schema>>;
};

type ZodHandlerOptions<Schema extends ZodHandlerSchema, Result> = {
  schema: Schema;
  handler: (params: ZodHandlerParams<Schema>) => Promise<Result>;
};

export function zodHandler<Schema extends ZodHandlerSchema, Result>({
  schema,
  handler,
}: ZodHandlerOptions<Schema, Result>) {
  return async function (event: APIGatewayProxyEvent, context: Context) {
    try {
      const rawInput = {
        path: event.pathParameters,
        query: event.queryStringParameters,
        body: JSON.parse(event.body ?? "{}"),
      };

      const input = {
        path: schema.path ? schema.path.parse(rawInput.path) : {},
        query: schema.query ? schema.query.parse(rawInput.query) : {},
        body: schema.body ? schema.body.parse(rawInput.body) : {},
      } as ZodHandlerInput<Schema>;

      const result = await handler({ context, event, input });
      return {
        body: JSON.stringify(result),
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
      };
    } catch (error) {
      console.error(error);
      return {
        body: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  };
}

export function handler<T>(
  lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<T>
) {
  return async function (event: APIGatewayProxyEvent, context: Context) {
    let body: string;
    let statusCode: number;

    try {
      // Run the Lambda
      body = JSON.stringify(await lambda(event, context));
      statusCode = 200;
    } catch (error) {
      console.error(error);
      statusCode = 500;
      body = JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Return HTTP response
    return {
      body,
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
      },
    };
  };
}
