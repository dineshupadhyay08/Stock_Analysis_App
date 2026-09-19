import React from "react";
import { Bell, Bookmark, Mail } from "lucide-react";

export function UpdatesFeaturesSection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-yellow-500/10 blur-3xl -z-10 rounded-full" />

            {/* Mock Watchlist and Alert UI */}
            <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
                <div>
                  <h4 className="text-foreground font-bold text-lg">My Watchlist</h4>
                  <p className="text-muted-foreground text-xs">Tracking 3 active symbols</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Bookmark className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { sym: "NVDA", name: "NVIDIA Corp.", price: "$118.20", change: "+4.12%", pos: true },
                  { sym: "TSLA", name: "Tesla Inc.", price: "$248.50", change: "-1.35%", pos: false },
                  { sym: "MSFT", name: "Microsoft Corp.", price: "$442.10", change: "+0.45%", pos: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div>
                      <div className="font-bold text-foreground text-sm">{item.sym}</div>
                      <div className="text-[10px] text-muted-foreground">{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-foreground font-medium text-sm">{item.price}</div>
                      <div className={`text-[10px] font-semibold ${item.pos ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs text-muted-foreground">Alerts configured: Daily 12:00 PM email summaries active</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium mb-6">
              <Mail className="w-4 h-4" /> Automated Tracking
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Stay Updated With <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">What Matters</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Never miss a critical market event. Curate your personal watchlist and let Signalist monitor the news and price action for you.
              Get automated, AI-personalized daily digests delivered straight to your inbox without having to open an app.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border/50 p-4 rounded-xl bg-muted/10">
                <Bookmark className="h-6 w-6 text-yellow-500 mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Custom Watchlists</h4>
                <p className="text-xs text-muted-foreground">Keep an eye on key stocks and track performance effortlessly.</p>
              </div>
              <div className="border border-border/50 p-4 rounded-xl bg-muted/10">
                <Bell className="h-6 w-6 text-yellow-500 mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Smart Alerts</h4>
                <p className="text-xs text-muted-foreground">Receive updates only when significant events occur.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
