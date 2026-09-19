import React from "react";
import { ArrowRight, Activity } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const MOCK_CANDLESTICKS = [
  { height: 35, isUp: true },
  { height: 42, isUp: true },
  { height: 28, isUp: false },
  { height: 50, isUp: true },
  { height: 45, isUp: false },
  { height: 60, isUp: true },
  { height: 55, isUp: true },
  { height: 48, isUp: false },
  { height: 65, isUp: true },
  { height: 70, isUp: true },
  { height: 58, isUp: false },
  { height: 62, isUp: true },
  { height: 75, isUp: true },
  { height: 68, isUp: false },
  { height: 80, isUp: true },
  { height: 72, isUp: false },
  { height: 85, isUp: true },
  { height: 78, isUp: false },
  { height: 82, isUp: true },
  { height: 90, isUp: true },
];

export function StockAnalysisPreviewSpotlight() {
  return (
    <section className="py-24 overflow-hidden bg-background">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1 relative w-full">
            <div className="absolute -inset-4 bg-blue-500/10 blur-2xl -z-10 rounded-full" />

            {/* Mock Chart UI */}
            <div className="bg-background border border-border/50 rounded-2xl p-5 shadow-2xl relative">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center text-background font-bold text-xl">A</div>
                  <div>
                    <h4 className="text-foreground font-bold text-lg leading-tight">AAPL</h4>
                    <span className="text-muted-foreground text-xs">Apple Inc. • NASDAQ</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-foreground font-bold text-xl">$174.49</div>
                  <div className="text-green-500 text-sm font-medium">+1.51 (0.87%)</div>
                </div>
              </div>

              <div className="relative h-60 w-full rounded-lg bg-muted/20 border border-border/50 flex items-end p-2 gap-1.5 overflow-hidden">
                {/* Deterministic Mock Candlesticks */}
                {MOCK_CANDLESTICKS.map((candle, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full pb-8 relative group">
                    <div className={`w-0.5 h-[80%] absolute top-4 ${candle.isUp ? "bg-green-700" : "bg-red-700"} opacity-30`} />
                    <div
                      className={`w-full rounded-sm z-10 ${candle.isUp ? "bg-green-500" : "bg-red-500"}`}
                      style={{ height: `${candle.height}%` }}
                    />
                  </div>
                ))}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none opacity-40 dark:from-background" />

                {/* Mock X-axis */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>09:30</span>
                  <span>11:00</span>
                  <span>13:00</span>
                  <span>15:30</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="bg-muted/30 rounded-lg p-2"><div className="text-[10px] text-muted-foreground">Open</div><div className="text-foreground text-xs font-semibold">173.00</div></div>
                <div className="bg-muted/30 rounded-lg p-2"><div className="text-[10px] text-muted-foreground">High</div><div className="text-foreground text-xs font-semibold">175.24</div></div>
                <div className="bg-muted/30 rounded-lg p-2"><div className="text-[10px] text-muted-foreground">Low</div><div className="text-foreground text-xs font-semibold">172.50</div></div>
                <div className="bg-muted/30 rounded-lg p-2"><div className="text-[10px] text-muted-foreground">Vol</div><div className="text-foreground text-xs font-semibold">54.2M</div></div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" /> Comprehensive Analysis
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Analyze Any Stock in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Depth</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Don&apos;t just look at the price. Dive into professional-grade TradingView charts, technical indicators, and comprehensive financial data.
              Our detailed symbol views give you the complete picture of a company&apos;s health and market position before you make a move.
            </p>
            <Button variant="outline" className="group rounded-full pl-6 pr-4 h-12" asChild>
              <Link href="/auth/sign-in">
                Explore Markets
                <span className="ml-2 bg-foreground text-background rounded-full p-1 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
