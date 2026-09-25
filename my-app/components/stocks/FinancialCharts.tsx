"use client";

import React, { useState } from "react";

// Simple SVG-based financial trend chart (no external dependencies)
interface TrendDataPoint {
  period: string;
  revenue: number | null;
  netIncome: number | null;
  eps: number | null;
}

interface FinancialTrendChartProps {
  data: TrendDataPoint[];
}

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "netIncome" | "eps">("revenue");

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No historical financial data available
      </div>
    );
  }

  // Get values for selected metric
  const values = data.map((d) => {
    const value = selectedMetric === "revenue" ? d.revenue : selectedMetric === "netIncome" ? d.netIncome : d.eps;
    return value ?? 0;
  });

  const maxValue = Math.max(...values.filter((v) => v > 0)) || 1;
  const minValue = Math.min(...values.filter((v) => v < 0), 0);
  const range = maxValue - minValue || 1;

  const width = 800;
  const height = 300;
  const padding = 40;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  const formatValue = (v: number) => {
    if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toFixed(0)}`;
  };

  // Calculate points
  const points = values.map((v, idx) => {
    const x = padding + (idx / (values.length - 1 || 1)) * plotWidth;
    const y = padding + plotHeight - ((v - minValue) / range) * plotHeight;
    return { x, y, v };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {["revenue", "netIncome", "eps"].map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedMetric === metric
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {metric === "revenue" ? "Revenue" : metric === "netIncome" ? "Net Income" : "EPS"}
          </button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="border border-border/20 rounded-lg bg-muted/5">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding + plotHeight * (1 - pct);
          const val = minValue + range * pct;
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              <text x={padding - 10} y={y} textAnchor="end" dy="0.3em" fontSize="12" fill="currentColor" opacity="0.5">
                {formatValue(val)}
              </text>
            </g>
          );
        })}

        {/* Chart line */}
        <path d={pathD} stroke="rgb(59, 130, 246)" fill="none" strokeWidth="2" />

        {/* Data points */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill="rgb(59, 130, 246)" />
        ))}

        {/* X-axis labels */}
        {data.map((d, idx) => {
          if (idx % Math.ceil(data.length / 6) === 0 || idx === data.length - 1) {
            const x = padding + (idx / (data.length - 1 || 1)) * plotWidth;
            return (
              <text key={idx} x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
                {d.period}
              </text>
            );
          }
        })}
      </svg>
    </div>
  );
}

// Earnings history chart
interface EarningsDataPoint {
  period: string;
  actual: number | null;
  estimate: number | null;
  surprise: number | null;
}

interface EarningsHistoryChartProps {
  data: EarningsDataPoint[];
}

export function EarningsHistoryChart({ data }: EarningsHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No earnings data available
      </div>
    );
  }

  const validData = data.filter((d) => d.actual !== null);
  if (validData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No earnings data available
      </div>
    );
  }

  const maxEps = Math.max(...validData.map((d) => Math.max(d.actual ?? 0, d.estimate ?? 0)));
  const minEps = Math.min(...validData.map((d) => Math.min(d.actual ?? 0, d.estimate ?? 0)));
  const range = maxEps - minEps || 1;

  const width = 800;
  const height = 300;
  const padding = 40;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;
  const barWidth = plotWidth / (validData.length * 2.5);

  return (
    <div className="space-y-4">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="border border-border/20 rounded-lg bg-muted/5">
        {/* Grid */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = padding + plotHeight * (1 - pct);
          return (
            <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.1" />
          );
        })}

        {/* Bars */}
        {validData.map((d, idx) => {
          const x = padding + (idx / validData.length) * plotWidth;
          const actualY = padding + plotHeight - ((d.actual ?? 0 - minEps) / range) * plotHeight;
          const estimateY = padding + plotHeight - ((d.estimate ?? 0 - minEps) / range) * plotHeight;

          return (
            <g key={idx}>
              {/* Actual */}
              <rect x={x} y={actualY} width={barWidth * 0.4} height={Math.abs(padding + plotHeight - actualY)} fill="rgb(59, 130, 246)" />
              {/* Estimate */}
              <rect
                x={x + barWidth * 0.45}
                y={estimateY}
                width={barWidth * 0.4}
                height={Math.abs(padding + plotHeight - estimateY)}
                fill="rgb(107, 114, 128)"
                opacity="0.5"
              />
              {/* Period label */}
              <text x={x + barWidth * 0.4} y={height - 10} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
                {d.period}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-muted-foreground">Actual EPS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded opacity-50" />
          <span className="text-muted-foreground">Estimated EPS</span>
        </div>
      </div>
    </div>
  );
}
