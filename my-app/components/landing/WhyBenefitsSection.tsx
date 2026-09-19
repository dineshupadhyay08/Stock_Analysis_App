import React from "react";
import { CheckCircle2 } from "lucide-react";

export function WhyBenefitsSection() {
  const benefits = [
    "Make confident decisions with real-time, verified data.",
    "Save hours of research with AI-powered news summaries.",
    "Easily scan the entire market with interactive heatmaps.",
    "Monitor your favorite assets with custom watchlists.",
    "Spot technical setups with pro-grade charting tools.",
    "Get daily email digests tailored to your portfolio.",
  ];

  return (
    <section className="py-24 bg-muted/10 border-y border-border/40 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Why Choose Signalist?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              In a market flooded with information, the edge goes to those who can filter the noise.
              Signalist provides the tools and insights you need to invest smarter, faster, and with greater conviction.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  <span className="text-base text-foreground font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
            <div className="bg-background border border-border/50 rounded-2xl p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                <div>
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Performance</div>
                  <div className="text-3xl font-bold text-foreground">Next-Gen Tooling</div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl">
                  🚀
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                </div>
                <div className="h-3 w-3/4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[70%] rounded-full" />
                </div>
                <div className="h-3 w-5/6 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[90%] rounded-full" />
                </div>
              </div>
              <p className="mt-8 text-sm text-muted-foreground text-center">
                Built on modern web technologies to ensure maximum performance and fluidity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
