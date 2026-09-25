"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "Overview" | "Chart" | "Financials" | "Technical Analysis" | "News" | "Profile";

interface StockTabsProps {
  children: React.ReactNode;
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function StockTabs({
  children,
  activeTab,
  onChange,
}: StockTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-6 border-b border-border/50 overflow-x-auto no-scrollbar">
        {(["Overview", "Chart", "Financials", "Technical Analysis", "News", "Profile"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap",
              activeTab === tab
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
