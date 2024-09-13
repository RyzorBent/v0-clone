import { getAuth } from "@clerk/remix/ssr.server";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
  dehydrate,
  FetchQueryOptions,
  QueryClient,
} from "@tanstack/react-query";
import { Resource } from "sst";
import { APIClient } from "./client";

export function api(args: LoaderFunctionArgs) {
  const url = Resource.API.url;

  return {
    prefetch: async (
      buildQueryOptions: (api: APIClient) => FetchQueryOptions,
    ) => {
      const auth = await getAuth(args);
      const token = await auth.getToken({ template: "lambda" });
      if (!token) {
        throw redirect("/sign-in");
      }
      const api = new APIClient(url, token);
      const queryClient = new QueryClient();
      const queryOptions = buildQueryOptions(api);
      await queryClient.ensureQueryData(queryOptions);
      return json({
        dehydratedState: dehydrate(queryClient),
      });
    },
  };
}
