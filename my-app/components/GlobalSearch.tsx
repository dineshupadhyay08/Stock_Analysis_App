"use client";
import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import SearchCommand from "./SearchCommand";

export default function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger search on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInputClick = () => {
    setShowSearch(true);
  };

  return (
    <>
      <div className="flex flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stocks (e.g. AAPL, TSLA, NVDA...) — Cmd+K"
          onClick={handleInputClick}
          readOnly
          className="flex-1 bg-muted/40 text-foreground placeholder-muted-foreground rounded-lg pl-10 pr-4 py-2 border border-border/40 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all hover:bg-muted/50"
        />
      </div>
      {showSearch && (
        <SearchCommand
          renderAs="button"
          label=""
          initialStocks={[]}
        />
      )}
    </>
  );
}

