"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import NavItems from "@/components/NavItems";
import { signOut } from "@/lib/actions/auth.actions";

type User = {
  name: string;
  email: string;
};

type StockWithWatchlistStatus = {
  id?: string;
  symbol?: string;
  isWatchlisted?: boolean;
};

type UserDropdownProps = {
  user?: User;
  initialStocks?: StockWithWatchlistStatus[];
};

const UserDropDown = ({
  user = {
    name: "Guest User",
    email: "guest@example.com",
  },
  initialStocks = [],
}: UserDropdownProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    // Hard purge of client-side auth-related storage first.
    try {
      localStorage.clear();
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}

    // Best-effort cookie purge (covers most auth cookie setups).
    try {
      const cookieNames = [
        "better-auth",
        "better-auth-session",
        "session",
        "token",
        "auth",
      ];

      for (const name of cookieNames) {
        document.cookie = `${name}=; Max-Age=0; path=/;`;
      }
    } catch {}

    await signOut();

    // One last hard redirect to guarantee no stale UI remains.
    window.location.href = "/auth/sign-in";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 text-gray-400 hover:text-yellow-500"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://avatars.githubusercontent.com/u/153423955?s=280&v=4" />
            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="hidden md:flex flex-col items-start">
            <span className="text-base font-medium text-gray-400">
              {user.name}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 text-gray-400" align="end">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-10 w-10">
              {/* <AvatarImage src="https://avatars.githubusercontent.com/u/153423955?s=280&v=4" /> */}
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff&bold=true`}
              />
              <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-400">
                {user.name}
              </span>

              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>

        <DropdownMenuSeparator className="hidden sm:block bg-gray-600" />

        <nav className="sm:hidden">
          <NavItems />
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropDown;
