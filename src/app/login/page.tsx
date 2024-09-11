import { redirect } from "next/navigation";
import { validateRequest } from "~/server/auth";

export default async function Page() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Sign in</h1>
      <a href="/login/github">Sign in with GitHub</a>
    </>
  );
}
