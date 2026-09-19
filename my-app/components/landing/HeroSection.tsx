import { Button } from "../ui/button";
import { ProductPreview } from "./ProductPreview";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div className="flex flex-col gap-6 z-10 relative overflow-hidden">
        <div className="absolute -inset-x-20 -inset-y-20 bg-blue-500/10 blur-[100px] rounded-full -z-10 dark:bg-blue-600/10 pointer-events-none"></div>
        <div className="inline-flex w-fit items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
          Smarter Insights. Brighter Decisions.
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Understand the Market{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400 dark:from-blue-400 dark:to-indigo-300">
            Before
          </span>{" "}
          You{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400 dark:from-blue-400 dark:to-indigo-300">
            Invest.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[500px] leading-relaxed">
          Real-time market data, powerful stock analysis, smart screeners and
          AI-powered insights — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform" asChild>
            <Link href="/auth/sign-up">
              Get Started Free →
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-semibold hover:bg-muted hover:scale-105 transition-transform" asChild>
            <Link href="/auth/sign-in">
              Explore Markets
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> No credit card required</span>
          <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Free plan available</span>
          <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Trusted by investors</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[800px] mx-auto lg:mx-0 lg:w-full xl:max-w-[700px] animate-in fade-in slide-in-from-bottom-10 duration-1000 overflow-hidden">
        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 blur-3xl -z-10 rounded-3xl"></div>
        <ProductPreview />
      </div>
    </section>
  );
}
