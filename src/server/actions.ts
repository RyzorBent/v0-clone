"use server";

import { generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { github, lucia, validateRequest } from "./auth";
import { Chat, Message } from "./db/schema";
import { db } from "./db";
import { generateId } from "lucia";

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

  const chatId = generateId(15);

  await db.transaction(async (tx) => {
    await tx.insert(Chat).values({
      id: chatId,
      userId: user.id,
    });

    await tx.insert(Message).values({
      id: generateId(15),
      chatId,
      content,
    });
  });

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
