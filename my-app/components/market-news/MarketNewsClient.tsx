"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNews } from "@/lib/actions/finnhub.actions";
import { formatTimeAgo, cn } from "@/lib/utils";

interface Article {
  id: string | number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  summary?: string;
}

function NewsCard({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 hover:border-blue-500/30 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
        {!imgError && article.image ? (
          <Image
            src={article.image}
            alt={article.headline}
            fill
            unoptimized
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted-foreground/10 text-muted-foreground/50">
            <span className="text-xs font-medium">News</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            {article.source}
          </span>

          <span className="text-muted-foreground/40 text-[10px]">•</span>

          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(article.datetime)}
          </span>
        </div>

        <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">
          {article.headline}
        </h3>

        {article.summary && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}

function NewsSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-border/40 bg-card animate-pulse">
      <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-muted" />

      <div className="flex flex-col justify-center flex-1 space-y-3">
        <div className="h-3 w-1/4 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

export default function MarketNewsClient({
  initialNews,
}: {
  initialNews: Article[];
}) {
  const [activeCategory, setActiveCategory] = useState("Market");
  const [articles, setArticles] = useState<Article[]>(initialNews);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { label: "Market", value: "Market" },
    { label: "Technology", value: "Technology" },
    { label: "Economy", value: "Economy" },
    { label: "Earnings", value: "Earnings" },
  ];

  useEffect(() => {
    async function fetchNews() {
      if (activeCategory === "Market" && initialNews.length > 0) {
        setArticles(initialNews);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const categoryValue =
          categories.find((c) => c.label === activeCategory)?.value ||
          "Market";

        const data = await getNews([], categoryValue);
        setArticles(data);
      } catch (e) {
        console.error("Failed to fetch news:", e);
        setError("Unable to load market stories");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [activeCategory, initialNews]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Market News
          </h1>

          <p className="text-muted-foreground mt-1">
            Real-time global market intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border border-border/40 w-fit">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap",
                activeCategory === cat.label
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => <NewsSkeleton key={i} />)
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-3xl">
            <p className="text-sm text-muted-foreground">{error}</p>

            <button
              onClick={() => setActiveCategory(activeCategory)}
              className="mt-4 px-4 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-3xl">
            <p className="text-sm text-muted-foreground">
              No stories available for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}