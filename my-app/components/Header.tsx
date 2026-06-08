import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
import UserDropDown from "./UserDropDown";

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

const Header = async () => {
  const auth = await getAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>

        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <UserDropDown
          user={{
            name: session?.user?.name ?? "Guest User",
            email: session?.user?.email ?? "guest@example.com",
          }}
        />
      </div>
    </header>
  );
};

export default Header;
