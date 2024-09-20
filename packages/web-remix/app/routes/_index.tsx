import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (userId) {
    return redirect("/chat");
  } else {
    return redirect("/sign-in");
  }
};
