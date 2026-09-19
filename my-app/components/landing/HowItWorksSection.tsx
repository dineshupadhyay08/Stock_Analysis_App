import React from "react";
import { Search, BarChart2, Brain, BellRing } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Discover",
      desc: "Find promising companies using our comprehensive symbol search and real-time market movers.",
    },
    {
      icon: BarChart2,
      step: "02",
      title: "Analyze",
      desc: "Examine detailed TradingView charts, technical indicators, and historical performance metrics.",
    },
    {
      icon: Brain,
      step: "03",
      title: "Understand",
      desc: "Let Google Gemini synthesize recent company news, earnings, and trends into clear bullet points.",
    },
    {
      icon: BellRing,
      step: "04",
      title: "Track",
      desc: "Add your favorites to a personalized watchlist and receive daily summaries directly to your inbox.",
    },
  ];

  return (
    <section className="py-24 bg-muted/10 border-y border-border/40 relative overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">How Signalist Works</h2>
          <p className="text-lg text-muted-foreground">A simple, four-step loop to keep you ahead of the market curve.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-background border border-border/50 shadow-sm flex flex-col items-start group hover:border-blue-500/50 transition-colors">
              <span className="text-4xl font-extrabold text-muted/40 group-hover:text-blue-500/20 transition-colors mb-4 block">
                {item.step}
              </span>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
