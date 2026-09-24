"use server";

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { cache } from "react";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } =
    revalidateSeconds
      ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export { fetchJSON };

export async function getQuotes(symbols: string[]): Promise<Record<string, { c: number, d: number, dp: number }>> {
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  const results: Record<string, { c: number, d: number, dp: number }> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      try {
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(sym)}&token=${token}`;
        const data = await fetchJSON<{ c: number, d: number, dp: number }>(url, 300);
        results[sym] = data;
      } catch (e) {
        console.error("Error fetching quote for", sym, e);
      }
    })
  );

  return results;
}


export async function getCompanyProfiles(symbols: string[]): Promise<Record<string, { name: string, logo: string, marketCap?: number, peRatio?: number }>> {
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  const results: Record<string, { name: string, logo: string, marketCap?: number, peRatio?: number }> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      try {
        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
        const profile = await fetchJSON<any>(url, 3600);
        results[sym] = {
          name: profile?.name || sym,
          logo: profile?.logo || "",
          marketCap: profile?.marketCapitalization,
          peRatio: profile?.peBasic,
        };
      } catch (e) {
        console.error("Error fetching profile for", sym, e);
      }
    })
  );

  return results;
}

const failedHistoricalCache = new Set<string>();

export async function getHistoricalData(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<{ c: number[] } | null> {
  // Use symbol and resolution only for cache key - time range doesn't matter for 403 errors
  const cacheKey = `${symbol}_${resolution}`;
  if (failedHistoricalCache.has(cacheKey)) {
    // Previously failed (403 permission error), avoid hammering the endpoint
    return null;
  }
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  try {
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${encodeURIComponent(
      symbol
    )}&resolution=${resolution}&from=${from}&to=${to}&token=${token}`;

    // Log parameters for debugging
    console.log(`Finnhub Candle Request: sym=${symbol}, res=${resolution}, from=${from}, to=${to}`);

    const data = await fetchJSON<{ s: string; c: number[] }>(url, 300);

    console.log(`Finnhub Candle Response Status: ${data?.s}`);
    console.log(`Finnhub Candle Data Count: ${data?.c?.length ?? 0}`);

    if (data.s === 'no_data') {
        return null;
    }

    return { c: data.c || [] };
  } catch (e: any) {
    if (e instanceof Error && e.message.includes("403")) {
      console.warn(`Historical data access forbidden for ${symbol} (403)`);
    } else {
      console.error("Error fetching historical data for", symbol, e);
    }
    // Record failure to prevent repeated attempts during this process lifetime
    failedHistoricalCache.add(cacheKey);
    return null;
  }
}

// Helper to rank and filter news by category using keywords
function rankArticlesByCategory(articles: RawNewsArticle[], category: string): RawNewsArticle[] {
  const categoryKeywords: Record<string, string[]> = {
    Market: [
      "S&P 500", "Nasdaq", "Dow Jones", "Russell 2000", "market movement",
      "volatility", "bull market", "bear market", "index", "trading volume",
      "wall street", "stocks rally", "stocks slide"
    ],
    Technology: [
      "AI", "Artificial Intelligence", "semiconductor", "chip", "Nvidia", "AMD",
      "Intel", "TSMC", "Microsoft", "Google", "Amazon", "Meta", "Apple",
      "Cloud", "Software", "Cybersecurity", "tech giant", "LLM", "GPT"
    ],
    Economy: [
      "Inflation", "CPI", "PPI", "GDP", "Employment", "Jobs", "Federal Reserve",
      "Fed", "Interest Rates", "Consumer Spending", "Trade", "Tariffs",
      "Economic Data", "Recession", "Monetary Policy"
    ],
    Earnings: [
      "Earnings", "Revenue", "EPS", "Quarterly", "Guidance", "Results",
      "Profit", "Fiscal", "Beat", "Miss", "Financial Report"
    ],
  };

  const keywords = categoryKeywords[category] || [];

  return articles
    .map(art => {
      let score = 0;
      const text = `${art.headline} ${art.summary}`.toLowerCase();

      keywords.forEach(kw => {
        if (text.includes(kw.toLowerCase())) {
          score += 1;
        }
      });

      return { art, score };
    })
    .filter(item => item.score > 0 || category === "Market") // Market is the general fallback
    .sort((a, b) => b.score - a.score || (b.art.datetime ?? 0) - (a.art.datetime ?? 0))
    .map(item => item.art);
}

export async function getNews(
  symbols?: string[],
  category: string = "general",
): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error("FINNHUB API key is not configured");
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const fetchPoolSize = 100; // Increase pool size for better filtering
    const finalCount = 15;

    // If we have symbols, try to fetch company news per symbol
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error("Error fetching company news for", sym, e);
            perSymbolArticles[sym] = [];
          }
        }),
      );

      const collected: MarketNewsArticle[] = [];
      for (let round = 0; round < finalCount; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= finalCount) break;
        }
        if (collected.length >= finalCount) break;
      }

      if (collected.length > 0) {
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, finalCount);
      }
    }

    // Determine Finnhub API category to use
    let apiCategory = "general";
    if (category === "Economy") {
      apiCategory = "economy";
    }

    const generalUrl = `${FINNHUB_BASE_URL}/news?category=${apiCategory}&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= fetchPoolSize) break;
    }

    // Rank and filter by the requested category
    const ranked = rankArticlesByCategory(unique, category);

    return ranked
      .slice(0, finalCount)
      .map((a, idx) => formatArticle(a, false, undefined, idx));
  } catch (err) {
    console.error("getNews error:", err);
    throw new Error("Failed to fetch news");
  }
}

/**
 * Comprehensive stock detail data for research pages
 * Combines quote + profile data
 */
export async function getStockDetail(symbol: string): Promise<{
  symbol: string;
  companyName: string;
  logo: string;
  exchange: string;
  currency: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  marketCap: number | null;
  peRatio: number | null;
  epsBasic: number | null;
  dividendYield: number | null;
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  industryName: string | null;
  sector: string | null;
  country: string | null;
  website: string | null;
  ipoDate: string | null;
  finnhubIndustry: string | null;
}> {
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  const upperSymbol = symbol.toUpperCase();
  let quoteData: any = {};
  let profileData: any = {};

  try {
    // Parallel fetch: quote + profile
    const [quote, profile] = await Promise.all([
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any>(url, 300);
        } catch (e) {
          console.error(`Error fetching quote for ${upperSymbol}:`, e);
          return {};
        }
      })(),
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any>(url, 3600);
        } catch (e) {
          console.error(`Error fetching profile for ${upperSymbol}:`, e);
          return {};
        }
      })(),
    ]);

    quoteData = quote || {};
    profileData = profile || {};
  } catch (e) {
    console.error(`Error fetching stock detail for ${upperSymbol}:`, e);
  }

  return {
    symbol: upperSymbol,
    companyName: profileData?.name || upperSymbol,
    logo: profileData?.logo || "",
    exchange: profileData?.exchange || "UNKNOWN",
    currency: profileData?.currency || "USD",
    // Quote data
    price: quoteData?.c ?? null,
    change: quoteData?.d ?? null,
    changePercent: quoteData?.dp ?? null,
    previousClose: quoteData?.pc ?? null,
    // Profile metrics
    marketCap: profileData?.marketCapitalization ?? null,
    peRatio: profileData?.peBasic ?? null,
    epsBasic: profileData?.epsBasic ?? null,
    dividendYield: profileData?.dividendYield ?? null,
    week52High: profileData?.['52WeekHigh'] ?? null,
    week52Low: profileData?.['52WeekLow'] ?? null,
    beta: profileData?.beta ?? null,
    industryName: profileData?.industryName ?? null,
    sector: profileData?.sector ?? null,
    country: profileData?.country ?? null,
    website: profileData?.weburl ?? null,
    ipoDate: profileData?.ipo ?? null,
    finnhubIndustry: profileData?.finnhubIndustry ?? null,
  };
}

export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        // If no token, log and return empty to avoid throwing per requirements
        console.error(
          "Error in stock search:",
          new Error("FINNHUB API key is not configured"),
        );
        return [];
      }

      const trimmed = typeof query === "string" ? query.trim() : "";

      let results: FinnhubSearchResult[] = [];

      if (!trimmed) {
        // Fetch top 10 popular symbols' profiles
        const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
        const profiles = await Promise.all(
          top.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
              // Revalidate every hour
              const profile = await fetchJSON<any>(url, 3600);
              return { sym, profile } as { sym: string; profile: any };
            } catch (e) {
              console.error("Error fetching profile2 for", sym, e);
              return { sym, profile: null } as { sym: string; profile: any };
            }
          }),
        );

        results = profiles
          .map(({ sym, profile }) => {
            const symbol = sym.toUpperCase();
            const name: string | undefined =
              profile?.name || profile?.ticker || undefined;
            const exchange: string | undefined = profile?.exchange || undefined;
            if (!name) return undefined;
            const r: FinnhubSearchResult = {
              symbol,
              description: name,
              displaySymbol: symbol,
              type: "Common Stock",
            };
            // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
            // To keep pipeline simple, attach exchange via closure map stage
            // We'll reconstruct exchange when mapping to final type
            (r as any).__exchange = exchange; // internal only
            return r;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        results = Array.isArray(data?.result) ? data.result : [];
      }

      const mapped: StockWithWatchlistStatus[] = results
        .map((r) => {
          const upper = (r.symbol || "").toUpperCase();
          const name = r.description || upper;
          const exchangeFromDisplay =
            (r.displaySymbol as string | undefined) || undefined;
          const exchangeFromProfile = (r as any).__exchange as
            | string
            | undefined;
          const exchange = exchangeFromDisplay || exchangeFromProfile || "US";
          const type = r.type || "Stock";
          const item: StockWithWatchlistStatus = {
            symbol: upper,
            name,
            exchange,
            type,
            isInWatchlist: false,
          };
          return item;
        })
        .slice(0, 15);

      return mapped;
    } catch (err) {
      console.error("Error in stock search:", err);
      return [];
    }
  },
);

/**
 * Comprehensive stock financial data aggregator
 * Fetches from multiple Finnhub endpoints and normalizes into one structure
 */
export async function getStockFinancials(symbol: string): Promise<{
  valuation: {
    marketCap: number | null;
    enterpriseValue: number | null;
    peRatio: number | null;
    psRatio: number | null;
    pbRatio: number | null;
    evEbitda: number | null;
    priceToFreeCashFlow: number | null;
    forwardPe: number | null;
  };
  priceHistory: {
    high52Week: number | null;
    low52Week: number | null;
    high52WeekDate: string | null;
    low52WeekDate: string | null;
    beta: number | null;
    avgVolume3M: number | null;
  };
  profitability: {
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    roa: number | null;
  };
  incomeStatement: {
    epsBasicTtm: number | null;
    epsBasicAnnual: number | null;
    revenuePerShare: number | null;
    ebitdaPerShare: number | null;
  };
  balanceSheet: {
    bookValuePerShare: number | null;
    currentRatio: number | null;
    debtToEquity: number | null;
  };
  cashFlow: {
    cashFlowPerShareTtm: number | null;
    freeCashFlowPerShare: number | null;
    capexCagr5Y: number | null;
  };
  dividends: {
    dividendYieldTtm: number | null;
    dividendPerShareTtm: number | null;
    dividendGrowth5Y: number | null;
    dividendIndicatedAnnual: number | null;
  };
  earnings: {
    latestEps: number | null;
    latestPeriod: string | null;
    latestSurprisePercent: number | null;
  };
  sentiment: {
    strongBuy: number | null;
    buy: number | null;
    hold: number | null;
    sell: number | null;
    strongSell: number | null;
  };
}> {
  const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  const upperSymbol = symbol.toUpperCase();

  try {
    // Fetch all financial endpoints in parallel
    const [metricData, earningsData, recommendationData] = await Promise.all([
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any>(url, 3600);
        } catch (e) {
          console.error(`Error fetching metrics for ${upperSymbol}:`, e);
          return {};
        }
      })(),
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/earnings?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any[]>(url, 3600);
        } catch (e) {
          console.error(`Error fetching earnings for ${upperSymbol}:`, e);
          return [];
        }
      })(),
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/recommendation?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any[]>(url, 3600);
        } catch (e) {
          console.error(`Error fetching recommendations for ${upperSymbol}:`, e);
          return [];
        }
      })(),
    ]);

    const metric = metricData?.metric || {};
    const latestEarnings = earningsData?.[0];
    const latestRecommendation = recommendationData?.[0];

    return {
      valuation: {
        marketCap: metric.marketCapitalization ?? null,
        enterpriseValue: metric.enterpriseValue ?? null,
        peRatio: metric.peExclExtraItemsAnnual ?? null,
        psRatio: metric.psRatio ?? null,
        pbRatio: metric.pbRatio ?? null,
        evEbitda: metric.evEbitdaTTM ?? null,
        priceToFreeCashFlow: metric["currentEv/freeCashFlowTTM"] ?? null,
        forwardPe: metric.forwardPE ?? null,
      },
      priceHistory: {
        high52Week: metric["52WeekHigh"] ?? null,
        low52Week: metric["52WeekLow"] ?? null,
        high52WeekDate: metric["52WeekHighDate"] ?? null,
        low52WeekDate: metric["52WeekLowDate"] ?? null,
        beta: metric.beta ?? null,
        avgVolume3M: metric["3MonthAverageTradingVolume"] ?? null,
      },
      profitability: {
        grossMargin: metric.grossMarginAnnual ?? null,
        operatingMargin: metric.operatingMarginAnnual ?? null,
        netMargin: metric.netMarginAnnual ?? null,
        roe: metric.roe ?? null,
        roa: metric.returnOnAssets ?? null,
      },
      incomeStatement: {
        epsBasicTtm: metric.epsBasicExclExtraItemsTTM ?? null,
        epsBasicAnnual: metric.epsBasicExclExtraItemsAnnual ?? null,
        revenuePerShare: metric.revenuePerShare ?? null,
        ebitdaPerShare: metric.ebitdPerShareTTM ?? null,
      },
      balanceSheet: {
        bookValuePerShare: metric.bookValuePerShareQuarterly ?? null,
        currentRatio: metric.currentRatioQuarterly ?? null,
        debtToEquity: metric.debtEquityRatioQuarterly ?? null,
      },
      cashFlow: {
        cashFlowPerShareTtm: metric.cashFlowPerShareTTM ?? null,
        freeCashFlowPerShare: metric.freeCashFlowPerShare ?? null,
        capexCagr5Y: metric.capexCagr5Y ?? null,
      },
      dividends: {
        dividendYieldTtm: metric.currentDividendYieldTTM ?? null,
        dividendPerShareTtm: metric.dividendPerShareTTM ?? null,
        dividendGrowth5Y: metric.dividendGrowthRate5Y ?? null,
        dividendIndicatedAnnual: metric.dividendIndicatedAnnual ?? null,
      },
      earnings: {
        latestEps: latestEarnings?.actual ?? null,
        latestPeriod: latestEarnings?.period ?? null,
        latestSurprisePercent: latestEarnings?.surprisePercent ?? null,
      },
      sentiment: {
        strongBuy: latestRecommendation?.strongBuy ?? null,
        buy: latestRecommendation?.buy ?? null,
        hold: latestRecommendation?.hold ?? null,
        sell: latestRecommendation?.sell ?? null,
        strongSell: latestRecommendation?.strongSell ?? null,
      },
    };
  } catch (err) {
    console.error(`Error fetching stock financials for ${upperSymbol}:`, err);
    // Return empty structure on error
    return {
      valuation: { marketCap: null, enterpriseValue: null, peRatio: null, psRatio: null, pbRatio: null, evEbitda: null, priceToFreeCashFlow: null, forwardPe: null },
      priceHistory: { high52Week: null, low52Week: null, high52WeekDate: null, low52WeekDate: null, beta: null, avgVolume3M: null },
      profitability: { grossMargin: null, operatingMargin: null, netMargin: null, roe: null, roa: null },
      incomeStatement: { epsBasicTtm: null, epsBasicAnnual: null, revenuePerShare: null, ebitdaPerShare: null },
      balanceSheet: { bookValuePerShare: null, currentRatio: null, debtToEquity: null },
      cashFlow: { cashFlowPerShareTtm: null, freeCashFlowPerShare: null, capexCagr5Y: null },
      dividends: { dividendYieldTtm: null, dividendPerShareTtm: null, dividendGrowth5Y: null, dividendIndicatedAnnual: null },
      earnings: { latestEps: null, latestPeriod: null, latestSurprisePercent: null },
      sentiment: { strongBuy: null, buy: null, hold: null, sell: null, strongSell: null },
    };
  }
}
