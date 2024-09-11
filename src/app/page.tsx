import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia, validateRequest } from "~/server/auth";
import { Editor } from "./_components/editor";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }
  return (
    <>
      <h1 className="text-2xl font-bold">Hi, {user.username}!</h1>
      <p>Your user ID is {user.id}.</p>
      <p>Your GitHub ID is {user.githubId}.</p>
      <Editor />
      <form action={logout}>
        <button>Sign out</button>
      </form>
    </>
  );
}

async function logout() {
  "use server";

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
