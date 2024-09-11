import { redirect } from "next/navigation";
import { signOut } from "~/server/actions";
import { validateRequest } from "~/server/auth";
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
      <form action={signOut}>
        <button>Sign out</button>
      </form>
    </>
  );
}
