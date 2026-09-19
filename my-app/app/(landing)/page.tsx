import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { WhatIsSection } from "@/components/landing/WhatIsSection";
import { WhyBenefitsSection } from "@/components/landing/WhyBenefitsSection";
import { FeaturesShowcaseSection } from "@/components/landing/FeaturesShowcaseSection";
import { StockAnalysisPreviewSpotlight } from "@/components/landing/StockAnalysisSpotlight";
import { AIFeaturesSection } from "@/components/landing/AIFeaturesSection";
import { UpdatesFeaturesSection } from "@/components/landing/UpdatesFeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* Real-time/demo ticker separator */}
        <MarketTicker />

        {/* 3. Short What is Signalist? */}
        <WhatIsSection />

        {/* 4. Why Signalist / Core Benefits */}
        <WhyBenefitsSection />

        {/* 5. Feature Showcase: 7 Core Pillars */}
        <FeaturesShowcaseSection />

        {/* 6. Analyze Any Stock in Depth (Interactive/Visual Product Preview) */}
        <StockAnalysisPreviewSpotlight />

        {/* 7. Turn Complex Market Data Into Clear Insights (AI Features) */}
        <AIFeaturesSection />

        {/* 8. Stay Updated With What Matters (News, Watchlist, Email) */}
        <UpdatesFeaturesSection />

        {/* 9. How Signalist Works (Discover -> Analyze -> Understand -> Track) */}
        <HowItWorksSection />

        {/* 10. Final Call to Action */}
        <FinalCTASection />
      </main>

      {/* 11. Footer */}
      <FooterSection />
    </div>
  );
}
