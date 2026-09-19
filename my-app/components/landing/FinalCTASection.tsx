import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-blue-600 to-indigo-700 p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Upgrade Your Market Strategy?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of smart investors using Signalist to track, analyze, and capitalize on market opportunities every single day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold h-12 px-8 rounded-full shadow-lg" asChild>
              <Link href="/auth/sign-up">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-12 px-8 rounded-full" asChild>
              <Link href="/auth/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
          <p className="text-xs text-blue-200 mt-6">
            No credit card required • Free access to essential features • Setup in 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
}
