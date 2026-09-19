import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">Signalist</Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/#market" className="hover:text-foreground transition-colors">Market</Link>
            <Link href="/#ai-analysis" className="hover:text-foreground transition-colors">AI Analysis</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/auth/sign-in" className="hidden sm:block text-sm font-medium hover:text-foreground transition-colors">Login</Link>
          <Button variant="default" size="sm" className="hidden sm:flex font-semibold hover:shadow-lg transition-all" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
