import React from "react";
import { LineChart, Zap, ShieldCheck } from "lucide-react";

export function WhatIsSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background scroll-mt-20">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Meet <span className="text-blue-500">Signalist</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Signalist is a next-generation financial intelligence platform built for modern investors. We simplify the complexity of the stock market by combining real-time data, advanced technical analysis, and AI-driven insights into one seamless experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: LineChart,
              title: "Market Data & Charts",
              desc: "Powered by Finnhub and TradingView to bring you market data and professional-grade charts.",
            },
            {
              icon: Zap,
              title: "Lightning Fast Analysis",
              desc: "Quickly screen stocks, evaluate trends, and dive into financials without missing a beat.",
            },
            {
              icon: ShieldCheck,
              title: "Clarity Over Noise",
              desc: "Cut through the noise with AI summaries that distill market news into clear, concise takeaways.",
            },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl bg-muted/20 border border-border/50 hover:border-blue-500/50 transition-colors">
              <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                <feat.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
              <p className="text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
