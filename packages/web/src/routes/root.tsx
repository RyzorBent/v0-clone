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
import { skipToken } from "@reduxjs/toolkit/query";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();              // Clerk status
  const tokenReady = useAppSelector(({ state }) => !!state.token);

  /* 1. Wait until Clerk has finished booting            */
  if (!isLoaded) return null;

  /* 2. If the user is signed-in, also wait for the JWT   */
  if (isSignedIn && !tokenReady) return null;

  /* 3. Either (a) signed-out, or (b) signed-in + token  */
  return <>{children}</>;
}

export function RootLayout() {
  return (<>
    <ReduxEffects />
    <AuthGate>
      <div className="flex h-screen w-screen bg-background">
        <HeaderOrSidebar />
        <Outlet />
      </div>
    </AuthGate>
  </>
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
        const token = await getToken({template: "lambda"});
        if (token) {
          dispatch(initialize({ token, userId }));
          dispatch(api.util.resetApiState());
        } else {
          console.error("no token found in root.tsx")
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
  const tokenReady = useAppSelector(({ state }) => Boolean(state.token));
  const activeChatId = useAppSelector(({ state }) => state.chatId);
  const { data } = useGetChatQuery(!tokenReady || !activeChatId ? skipToken : activeChatId);

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
