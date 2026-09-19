import React from "react";
import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12 text-sm text-muted-foreground">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">S</div>
              <span className="font-bold text-foreground text-base tracking-tight">Signalist</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Intelligent market analysis, charts, and news summarized by AI for active traders and long-term investors.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/auth/sign-in" className="hover:text-foreground">Markets</Link></li>
              <li><Link href="/auth/sign-in" className="hover:text-foreground">Stock Screener</Link></li>
              <li><Link href="/auth/sign-in" className="hover:text-foreground">Watchlist</Link></li>
              <li><Link href="/auth/sign-in" className="hover:text-foreground">AI Digest</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground">API Status</Link></li>
              <li><Link href="#" className="hover:text-foreground">Market Hours</Link></li>
              <li><Link href="#" className="hover:text-foreground">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} Signalist Inc. All rights reserved. Not financial advice.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Twitter</Link>
            <Link href="#" className="hover:text-foreground">GitHub</Link>
            <Link href="#" className="hover:text-foreground">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
