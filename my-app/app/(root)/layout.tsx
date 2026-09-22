import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch authenticated user session
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user ? { name: session.user.name, email: session.user.email } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}