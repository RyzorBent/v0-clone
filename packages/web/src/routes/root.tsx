import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Code2 } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useParams } from "react-router-dom";

import { Sidebar } from "~/components/sidebar";
import { Button } from "~/components/ui/button";
import { api, useGetChatQuery } from "~/lib/api";
import { startListening } from "~/lib/realtime";
import { activeChatChanged, initialize } from "~/lib/state";
import { useAppDispatch, useAppSelector } from "~/lib/store";

export function RootLayout() {
  return (
    <div className="flex h-screen w-screen bg-background">
      <ReduxEffects />
      <HeaderOrSidebar />
      <Outlet />
    </div>
  );
}

function ReduxEffects() {
  const params = useParams() as { id?: string };

  const { userId, getToken } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return startListening();
  }, []);

  useEffect(() => {
    if (userId) {
      const populate = async () => {
        // Request token with specific template ensuring userId is in sub claim
        const token = await getToken({
          template: "p4_template",
        }).catch(async () => {
          // Fallback to default token if template doesn't exist
          console.log("Falling back to default JWT template");
          return await getToken();
        });

        if (token) {
          console.log("Got token from Clerk", {
            userId,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
          });
          dispatch(initialize({ token, userId }));
          dispatch(api.util.resetApiState());
        }
      };
      populate();
    }
  }, [userId, getToken, dispatch]);

  useEffect(() => {
    if (params.id) {
      dispatch(activeChatChanged(params.id));
    } else {
      dispatch(activeChatChanged(null));
    }
  }, [params.id, dispatch]);

  return null;
}

function HeaderOrSidebar() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return isSignedIn ? <Sidebar /> : <SignedOutHeader />;
}

function SignedOutHeader() {
  const activeChatId = useAppSelector(({ state }) => state.chatId);
  const { data } = useGetChatQuery(activeChatId ?? "");

  return (
    <div className="absolute inset-0 top-0 z-10 flex h-16 items-center justify-between gap-3 px-3">
      <Link to="/" className="mb-1 rounded-full bg-primary p-2">
        <Code2 className="size-5 text-primary-foreground" />
        <span className="sr-only">v0</span>
      </Link>
      {data && (
        <h1 className="font-semibold">{data.title ?? "Untitled Chat"}</h1>
      )}

      <SignInButton mode="modal">
        <Button className="ml-auto">Sign In</Button>
      </SignInButton>
    </div>
  );
}
