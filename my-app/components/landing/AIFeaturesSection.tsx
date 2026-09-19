import React from "react";
import { Sparkles } from "lucide-react";

export function AIFeaturesSection() {
  return (
    <section id="ai-analysis" className="py-24 bg-muted/20 border-y border-border/40 overflow-hidden scroll-mt-20">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Powered by Google Gemini
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Turn Complex Market Data Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Clear Insights</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Reading dozens of financial articles takes time you don&apos;t have. Signalist uses advanced AI algorithms
              to read, analyze, and distill the daily market news into bite-sized, actionable takeaways.
              Understand the &quot;why&quot; behind the market moves in seconds.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="text-purple-500 font-bold mt-1">•</span>
                <span>Personalized investment strategies upon sign-up.</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="text-purple-500 font-bold mt-1">•</span>
                <span>Automated daily digests summarizing your watchlist.</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="text-purple-500 font-bold mt-1">•</span>
                <span>Sentiment analysis mapping news to price action.</span>
              </li>
            </ul>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-purple-500/10 blur-3xl -z-10 rounded-full" />

            {/* Mock AI Insight Card */}
            <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
               <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                 </div>
                 <div>
                   <h4 className="text-foreground font-bold text-lg">AI Market Summary</h4>
                   <p className="text-muted-foreground text-xs">Generated today at 12:00 PM</p>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                    <div className="text-foreground font-medium mb-1">Tech Sector Rally</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Major semiconductor stocks are surging following positive Q3 guidance. Expect sustained momentum in AI hardware suppliers through the week.
                    </p>
                 </div>
                 <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                    <div className="text-foreground font-medium mb-1">Fed Rate Decision</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Markets remain cautious ahead of tomorrow&apos;s interest rate announcement. Consumer discretionary stocks show slight defensive positioning.
                    </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
