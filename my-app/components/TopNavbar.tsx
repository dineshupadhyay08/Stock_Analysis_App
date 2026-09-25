import GlobalSearch from "./GlobalSearch";
import NotificationButton from "./NotificationButton";
import UserProfile from "./UserProfile";
import { ThemeToggle } from "./ThemeToggle";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

export default async function TopNavbar() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Global Search */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="w-full max-w-[440px]">
            <GlobalSearch />
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-6 flex shrink-0 items-center gap-3">
          <NotificationButton />
          <ThemeToggle />
          <UserProfile user={user} />
        </div>
      </div>
    </header>
  );
}
