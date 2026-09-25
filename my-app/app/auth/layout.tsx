import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth!.api.getSession({ headers: await headers() });

  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Section - Form */}
      <section className="relative z-10 w-full lg:w-1/2 px-4 lg:px-12 xl:px-20 py-6 flex flex-col min-h-screen lg:min-h-0">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-foreground mb-8 lg:mb-12">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist logo"
            width={140}
            height={32}
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {children}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          © {new Date().getFullYear()} Signalist. All rights reserved.
        </p>
      </section>

      {/* Right Section - Visual */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-muted/30 via-muted/10 to-background border-l border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full h-screen">
          {/* Testimonial */}
          <div className="mt-auto">
            <blockquote className="text-xl xl:text-2xl font-medium text-foreground/90 leading-relaxed mb-6">
              &quot;Signalist turned my watchlist into a winning list. The alerts are spot-on, and I feel more confident making moves in the market.&quot;
            </blockquote>
            <div className="flex items-center justify-between">
              <div>
                <cite className="text-base font-bold text-foreground not-italic">— Ethan R.</cite>
                <p className="text-sm text-muted-foreground">Retail Investor</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Image
                    key={star}
                    src="/assets/icons/star.svg"
                    alt="Star"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-8 rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
            <Image
              src="/assets/images/dashboard.png"
              alt="Dashboard Preview"
              width={750}
              height={500}
              priority
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Layout;
