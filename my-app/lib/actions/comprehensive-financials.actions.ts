"use server";

import { fetchJSON } from "./finnhub.actions";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

interface FinancialLineItem {
  concept: string;
  unit: string;
  label: string;
  value: number;
}

interface FinancialPeriod {
  year: number;
  quarter: number;
  endDate: string;
  form: string;
  filedDate: string;
}

interface NormalizedFinancialStatement {
  period: FinancialPeriod;
  incomeStatement: Map<string, number>;
  balanceSheet: Map<string, number>;
  cashFlow: Map<string, number>;
}

/**
 * Parse financial statement line items into a map
 */
function parseFinancialItems(items: FinancialLineItem[]): Map<string, number> {
  const map = new Map<string, number>();
  if (!items) return map;

  items.forEach((item) => {
    if (item.label && item.value !== undefined && item.value !== null) {
      map.set(item.label, item.value);
    }
  });

  return map;
}

/**
 * Fetch and normalize comprehensive financial data from multiple Finnhub endpoints
 */
export async function getComprehensiveFinancials(symbol: string): Promise<{
  latestPeriod: FinancialPeriod | null;
  historicalStatements: NormalizedFinancialStatement[];
  incomeStatementTrend: Array<{
    period: string;
    revenue: number | null;
    netIncome: number | null;
    eps: number | null;
  }>;
  earningsHistory: Array<{
    period: string;
    actual: number | null;
    estimate: number | null;
    surprise: number | null;
  }>;
  valuation: Record<string, number | null>;
  profitability: Record<string, number | null>;
  priceHistory: Record<string, number | null>;
}> {
  const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB API key is not configured");
  }

  const upperSymbol = symbol.toUpperCase();

  try {
    // Fetch all data in parallel
    const [financialsReported, metricsData, earningsData] = await Promise.all([
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/financials-reported?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any>(url, 7200); // Cache 2 hours
        } catch (e) {
          console.error(`Error fetching financials-reported for ${upperSymbol}:`, e);
          return { data: [] };
        }
      })(),
      (async () => {
        try {
          const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
          return await fetchJSON<any>(url, 3600);
        } catch (e) {
          console.error(`Error fetching metrics for ${upperSymbol}:`, e);
          return { metric: {} };
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
    ]);

    // Parse financial statements
    const statements: NormalizedFinancialStatement[] = [];
    let latestPeriod: FinancialPeriod | null = null;

    if (financialsReported?.data && Array.isArray(financialsReported.data)) {
      financialsReported.data.forEach((report: any, idx: number) => {
        if (idx === 0) {
          latestPeriod = {
            year: report.year,
            quarter: report.quarter,
            endDate: report.endDate,
            form: report.form,
            filedDate: report.filedDate,
          };
        }

        if (report.report) {
          statements.push({
            period: {
              year: report.year,
              quarter: report.quarter,
              endDate: report.endDate,
              form: report.form,
              filedDate: report.filedDate,
            },
            incomeStatement: parseFinancialItems(report.report.ic || []),
            balanceSheet: parseFinancialItems(report.report.bs || []),
            cashFlow: parseFinancialItems(report.report.cf || []),
          });
        }
      });
    }

  // Build income statement trend (last 8 periods)
  const incomeStatementTrend = statements.slice(0, 8).reverse().map((stmt) => {
    const period = stmt.period.quarter === 0
      ? `FY ${stmt.period.year}`
      : `Q${stmt.period.quarter} ${stmt.period.year}`;

    // Try multiple common labels for Revenue, Net Income, and EPS
    const getVal = (map: Map<string, number>, keys: string[]) => {
      for (const key of keys) {
        if (map.has(key)) return map.get(key) ?? null;
      }
      return null;
    };

    return {
      period,
      revenue: getVal(stmt.incomeStatement, ["Net sales", "Revenue", "Total revenue", "Total net sales"]),
      netIncome: getVal(stmt.incomeStatement, ["Net income", "Net income loss", "Net income available to common stockholders"]),
      eps: getVal(stmt.incomeStatement, ["Diluted earnings per share", "Earnings per share", "Basic earnings per share"]),
    };
  });

    // Build earnings history trend
    const earningsHistory = (earningsData || []).slice(0, 12).reverse().map((earning: any) => ({
      period: earning.period,
      actual: earning.actual ?? null,
      estimate: earning.estimate ?? null,
      surprise: earning.surprisePercent ?? null,
    }));

    // Extract valuation metrics
    const metric = metricsData?.metric || {};
    const valuation = {
      marketCap: metric.marketCapitalization ?? null,
      enterpriseValue: metric.enterpriseValue ?? null,
      peRatio: metric.peExclExtraItemsAnnual ?? null,
      psRatio: metric.psRatio ?? null,
      pbRatio: metric.pbRatio ?? null,
      evEbitda: metric.evEbitdaTTM ?? null,
      priceToFreeCashFlow: metric["currentEv/freeCashFlowTTM"] ?? null,
      forwardPe: metric.forwardPE ?? null,
      dividendYield: metric.currentDividendYieldTTM ?? null,
    };

    const profitability = {
      grossMargin: metric.grossMarginAnnual ?? null,
      operatingMargin: metric.operatingMarginAnnual ?? null,
      netMargin: metric.netMarginAnnual ?? null,
      roe: metric.roe ?? null,
      roa: metric.returnOnAssets ?? null,
      roic: metric.roic ?? null,
    };

    const priceHistory = {
      high52Week: metric["52WeekHigh"] ?? null,
      low52Week: metric["52WeekLow"] ?? null,
      beta: metric.beta ?? null,
      avgVolume3M: metric["3MonthAverageTradingVolume"] ?? null,
    };

    return {
      latestPeriod,
      historicalStatements: statements,
      incomeStatementTrend,
      earningsHistory,
      valuation,
      profitability,
      priceHistory,
    };
  } catch (err) {
    console.error(`Error fetching comprehensive financials for ${upperSymbol}:`, err);
    return {
      latestPeriod: null,
      historicalStatements: [],
      incomeStatementTrend: [],
      earningsHistory: [],
      valuation: {},
      profitability: {},
      priceHistory: {},
    };
  }
}
