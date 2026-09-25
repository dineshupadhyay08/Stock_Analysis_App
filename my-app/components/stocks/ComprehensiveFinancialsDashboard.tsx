"use client";

import React from "react";
import { FinancialTrendChart, EarningsHistoryChart } from "./FinancialCharts";

interface ComprehensiveFinancialsProps {
  data: Awaited<ReturnType<typeof import("@/lib/actions/comprehensive-financials.actions").getComprehensiveFinancials>>;
}

const formatCurrency = (v: number | null) => {
  if (v === null) return "—";
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
};

const formatNumber = (v: number | null) => {
  if (v === null) return "—";
  return v.toFixed(2);
};

const formatPercent = (v: number | null) => {
  if (v === null) return "—";
  return `${v.toFixed(2)}%`;
};

interface MetricRowProps {
  label: string;
  value: number | null;
  format?: (v: number) => string;
}

function MetricRow({ label, value, format }: MetricRowProps) {
  const display = value === null ? "—" : format ? format(value) : String(value);
  return (
    <div className="flex justify-between py-3 border-b border-border/20 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{display}</span>
    </div>
  );
}

interface FinancialCardProps {
  title: string;
  metrics: Array<{ label: string; value: number | null; format?: (v: number) => string }>;
}

function FinancialCard({ title, metrics }: FinancialCardProps) {
  const hasData = metrics.some((m) => m.value !== null);
  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="space-y-0">
        {metrics.map((metric, idx) => (
          <MetricRow key={idx} {...metric} />
        ))}
      </div>
    </div>
  );
}

function StatementTable({
  title,
  statements,
}: {
  title: string;
  statements: Awaited<ReturnType<typeof import("@/lib/actions/comprehensive-financials.actions").getComprehensiveFinancials>>["historicalStatements"];
}) {
  if (statements.length === 0) return null;

  // Get unique line items from first 4 statements
  const lineItems = new Set<string>();
  statements.slice(0, 4).forEach((stmt) => {
    if (title.includes("Income")) {
      stmt.incomeStatement.forEach((_, label) => lineItems.add(label));
    } else if (title.includes("Balance")) {
      stmt.balanceSheet.forEach((_, label) => lineItems.add(label));
    } else {
      stmt.cashFlow.forEach((_, label) => lineItems.add(label));
    }
  });

  if (lineItems.size === 0) return null;

  const items = Array.from(lineItems).slice(0, 10);

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Metric</th>
              {statements.slice(0, 4).map((stmt, idx) => {
                const period = stmt.period.quarter === 0 ? `FY ${stmt.period.year}` : `Q${stmt.period.quarter} ${stmt.period.year}`;
                return (
                  <th key={idx} className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">
                    {period}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item} className="border-b border-border/10 hover:bg-muted/5">
                <td className="py-3 px-2 text-muted-foreground">{item}</td>
                {statements.slice(0, 4).map((stmt, idx) => {
                  const map =
                    title.includes("Income") ? stmt.incomeStatement : title.includes("Balance") ? stmt.balanceSheet : stmt.cashFlow;
                  const value = map.get(item);
                  return (
                    <td key={idx} className="text-right py-3 px-2 text-foreground font-medium">
                      {value === undefined || value === null ? "—" : formatCurrency(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComprehensiveFinancialsDashboard({ data }: ComprehensiveFinancialsProps) {
  return (
    <div className="space-y-8">
      {/* Fiscal Period Info */}
      {data.latestPeriod && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Fiscal Information</h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Fiscal Year End</div>
              <div className="text-lg font-bold text-foreground">{data.latestPeriod.year}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Last Period</div>
              <div className="text-lg font-bold text-foreground">
                {data.latestPeriod.quarter === 0 ? `FY ${data.latestPeriod.year}` : `Q${data.latestPeriod.quarter}`}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Period End</div>
              <div className="text-lg font-bold text-foreground">{data.latestPeriod.endDate?.split(" ")[0]}</div>
            </div>
          </div>
        </div>
      )}

      {/* Valuation Overview */}
      <FinancialCard
        title="Valuation"
        metrics={[
          { label: "Market Cap", value: data.valuation.marketCap, format: formatCurrency },
          { label: "Enterprise Value", value: data.valuation.enterpriseValue, format: formatCurrency },
          { label: "P/E Ratio", value: data.valuation.peRatio, format: formatNumber },
          { label: "Forward P/E", value: data.valuation.forwardPe, format: formatNumber },
          { label: "P/S Ratio", value: data.valuation.psRatio, format: formatNumber },
          { label: "P/B Ratio", value: data.valuation.pbRatio, format: formatNumber },
          { label: "EV/EBITDA", value: data.valuation.evEbitda, format: formatNumber },
          { label: "Price/FCF", value: data.valuation.priceToFreeCashFlow, format: formatNumber },
        ]}
      />

      {/* Financial Trend Chart */}
      {data.incomeStatementTrend.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Financial Trends</h3>
          <FinancialTrendChart data={data.incomeStatementTrend} />
        </div>
      )}

      {/* Earnings History */}
      {data.earningsHistory.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Earnings History</h3>
          <EarningsHistoryChart data={data.earningsHistory} />
          {data.earningsHistory[0] && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <MetricRow label="Latest EPS (Actual)" value={data.earningsHistory[0].actual} format={formatNumber} />
              <MetricRow label="Latest EPS (Estimate)" value={data.earningsHistory[0].estimate} format={formatNumber} />
              <MetricRow label="Surprise %" value={data.earningsHistory[0].surprise} format={formatPercent} />
            </div>
          )}
        </div>
      )}

      {/* Income Statement Table */}
      <StatementTable title="Income Statement" statements={data.historicalStatements} />

      {/* Balance Sheet Table */}
      <StatementTable title="Balance Sheet" statements={data.historicalStatements} />

      {/* Cash Flow Table */}
      <StatementTable title="Cash Flow" statements={data.historicalStatements} />

      {/* Profitability */}
      <FinancialCard
        title="Profitability"
        metrics={[
          { label: "Gross Margin", value: data.profitability.grossMargin, format: formatPercent },
          { label: "Operating Margin", value: data.profitability.operatingMargin, format: formatPercent },
          { label: "Net Margin", value: data.profitability.netMargin, format: formatPercent },
          { label: "ROA", value: data.profitability.roa, format: formatPercent },
          { label: "ROE", value: data.profitability.roe, format: formatPercent },
          { label: "ROIC", value: data.profitability.roic, format: formatPercent },
        ]}
      />

      {/* Price History */}
      <FinancialCard
        title="Price History"
        metrics={[
          { label: "52 Week High", value: data.priceHistory.high52Week, format: formatCurrency },
          { label: "52 Week Low", value: data.priceHistory.low52Week, format: formatCurrency },
          { label: "Beta", value: data.priceHistory.beta, format: formatNumber },
          { label: "Avg Volume (3M)", value: data.priceHistory.avgVolume3M, format: (v) => `${(v / 1e6).toFixed(1)}M` },
        ]}
      />

      {/* Dividend */}
      {data.valuation.dividendYield !== null && (
        <FinancialCard
          title="Dividends"
          metrics={[
            { label: "Dividend Yield", value: data.valuation.dividendYield, format: formatPercent },
          ]}
        />
      )}
    </div>
  );
}
