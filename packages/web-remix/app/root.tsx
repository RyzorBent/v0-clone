import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { ClerkApp } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useRef } from "react";
import { Provider } from "react-redux";

import { Toaster } from "~/components/ui/sonner";
import { startListening } from "./lib/realtime";
import { initialize } from "./lib/state";
import { store } from "./lib/store";

import "./tailwind.css";

export const loader = async (args: LoaderFunctionArgs) => {
  return await rootAuthLoader(args, async ({ request }) => {
    return {
      userId: request.auth.userId,
      token: await request.auth.getToken({ template: "lambda" }),
    };
  });
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default ClerkApp(function App() {
  const { token, userId } = useLoaderData<typeof loader>();
  const ref = useRef<boolean>(false);
  if (token && userId && !ref.current && typeof window !== "undefined") {
    startListening();
    store.dispatch(initialize({ token, userId }));
    ref.current = true;
  }

  return (
    <Provider store={store}>
      <Outlet />
      <Toaster />
    </Provider>
  );
});
