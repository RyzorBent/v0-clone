import type { User } from "lucia";
import { Code2, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signOut } from "~/server/actions";
import { validateRequest } from "~/server/auth";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <aside className="flex w-16 flex-col items-center justify-between border-r bg-muted p-4">
        <Link href="/">
          <Code2 />
          <span className="sr-only">v0</span>
        </Link>
        <UserButton user={user} />
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}

function UserButton({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-10 border">
          {user.image ? (
            <AvatarImage src={user.image} width={40} height={40} />
          ) : (
            <AvatarFallback>{user.username?.slice(0, 2) ?? "-"}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem className="w-full gap-2" asChild>
            <button type="submit">
              <LogOut className="size-4" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
