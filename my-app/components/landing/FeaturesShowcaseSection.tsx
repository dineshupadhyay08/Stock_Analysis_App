import React from "react";
import Link from "next/link";
import { Search, TrendingUp, BarChart3, Newspaper, SlidersHorizontal, Sparkles } from "lucide-react";

export function FeaturesShowcaseSection() {
  const features = [
    {
      icon: Search,
      title: "Stock Search",
      description: "Instantly lookup any ticker across global exchanges with intelligent auto-complete and company info.",
    },
    {
      icon: TrendingUp,
      title: "Market Data",
      description: "Live, low-latency pricing and quotes powered directly by Finnhub feeds.",
    },
    {
      icon: BarChart3,
      title: "Stock Analysis",
      description: "In-depth technical gauges, baseline charts, and candlestick views via embedded TradingView.",
    },
    {
      icon: Newspaper,
      title: "Market News",
      description: "Curated financial news covering broad macro conditions and company-specific press releases.",
    },
    {
      icon: SlidersHorizontal,
      title: "Stock Screener",
      description: "Sector heatmaps and multi-category filters to rapidly surface top gainers, losers, and volume movers.",
    },
    {
      icon: Sparkles,
      title: "AI Analysis",
      description: "Signalist uses AI to turn complex financial and market information into clear, digestible insights.",
      href: "/#ai-analysis",
    },
  ];

  return (
    <section id="market" className="py-24 bg-background scroll-mt-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to <span className="text-blue-500">Master the Market</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed to take you from initial idea to well-informed investment decision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const cardContent = (
              <>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </>
            );

            const cardClasses =
              "group block p-6 rounded-2xl bg-muted/10 border border-border/50 hover:border-blue-500/30 transition-all hover:shadow-lg";

            if (feat.href) {
              return (
                <Link key={idx} href={feat.href} className={cardClasses}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={idx} className={cardClasses}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
