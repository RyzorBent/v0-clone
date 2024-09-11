"use server";

import { ChatAPI } from "@project-4/core/chat";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { github, lucia, validateRequest } from "./auth";

export async function createChat(data: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const content = data.get("content");
  if (!content || typeof content !== "string") {
    return {
      error: "Content is required",
    };
  }

  const chatId = await ChatAPI.create(user.id, content);

  redirect(`/${chatId}`);
}

export async function signInWithGitHub() {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);

  cookies().set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  redirect(url.toString());
}

export async function signOut() {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  redirect("/login");
}
