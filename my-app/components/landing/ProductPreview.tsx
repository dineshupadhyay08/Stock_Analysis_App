'use client';
import { useState, useEffect } from 'react';
import { Search, Sparkles, LayoutDashboard, Star, TrendingUp, Newspaper, BrainCircuit, Wallet, Settings } from "lucide-react";
import { getQuotes, getCompanyProfiles, getHistoricalData } from "@/lib/actions/finnhub.actions";

export function ProductPreview() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [chartRange, setChartRange] = useState("1D");
  const [historicalData, setHistoricalData] = useState<number[]>([]);
  const [moversData, setMoversData] = useState<any[]>([]);
  const [mainStockData, setMainStockData] = useState<any>(null);
  const [indexesData, setIndexesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      const symbols = ["NVDA", "GOOGL", "TSLA", "AMD", "MSFT", "AAPL", "AMZN"];
      const indexSymbols = ["SPY", "QQQ", "DIA"]; // Using ETFs as fallback per diagnosis

      const [quotes, profiles, indexQuotes] = await Promise.all([
        getQuotes(symbols),
        getCompanyProfiles(symbols),
        getQuotes(indexSymbols)
      ]);

      const movers = Object.keys(quotes)
        .map(symbol => ({ ...quotes[symbol], symbol }))
        .sort((a, b) => Math.abs(b.dp) - Math.abs(a.dp))
        .slice(0, 5)
        .map(m => ({
          s: m.symbol,
          n: profiles[m.symbol]?.name || m.symbol,
          logo: profiles[m.symbol]?.logo || "",
          changePercent: m.dp,
          changeStr: (m.dp >= 0 ? "+" : "") + m.dp.toFixed(2) + "%"
        }));

      const indexes = [
        { n: "S&P 500", s: "SPY" },
        { n: "NASDAQ", s: "QQQ" },
        { n: "DOW", s: "DIA" },
      ].map(idx => ({
        ...idx,
        price: indexQuotes[idx.s] ? `$${indexQuotes[idx.s].c.toFixed(2)}` : "N/A",
        change: indexQuotes[idx.s] ? indexQuotes[idx.s].dp.toFixed(2) : "0.00",
        pos: indexQuotes[idx.s] ? indexQuotes[idx.s].dp >= 0 : true
      }));

      setMoversData(movers);
      setIndexesData(indexes);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchMainStockData() {
      setIsLoading(true);
      try {
        const [quote, profile] = await Promise.all([
          getQuotes([selectedSymbol]),
          getCompanyProfiles([selectedSymbol])
        ]);

        const q = quote[selectedSymbol];
        const p = profile[selectedSymbol];

        setMainStockData({
          s: selectedSymbol,
          n: p?.name || selectedSymbol,
          logo: p?.logo || "",
          price: q ? `$${q.c.toFixed(2)}` : "Unavailable",
          change: q ? `${q.dp >= 0 ? "+" : ""}${q.dp.toFixed(2)}% (${q.d > 0 ? "+" : ""}${q.d.toFixed(2)})` : "N/A",
          pos: q ? q.dp >= 0 : true
        });
      } catch (e) {
        console.error(e);
        setMainStockData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMainStockData();
  }, [selectedSymbol]);

  useEffect(() => {
    async function fetchChart() {
      setIsChartLoading(true);
      try {
        const now = Math.floor(Date.now() / 1000);
        let from = now - 24 * 3600;
        let resolution = "15";

        if (chartRange === "1D") {
          from = now - 24 * 3600;
          resolution = "5";
        } else if (chartRange === "1W") {
          from = now - 7 * 24 * 3600;
          resolution = "30";
        } else if (chartRange === "1M") {
          from = now - 30 * 24 * 3600;
          resolution = "D";
        } else if (chartRange === "6M") {
          from = now - 180 * 24 * 3600;
          resolution = "D";
        } else if (chartRange === "1Y") {
          from = now - 365 * 24 * 3600;
          resolution = "W";
        }

        const data = await getHistoricalData(selectedSymbol, resolution, from, now);
        console.log(`Historical Data Debug [${selectedSymbol}][${chartRange}]:`, data);
        setHistoricalData(data?.c || []);
      } catch (e) {
        console.error("Failed to fetch historical chart:", e);
        setHistoricalData([]);
      } finally {
        setIsChartLoading(false);
      }
    }
    fetchChart();
  }, [selectedSymbol, chartRange]);

  // Helper to compute SVG coordinates
  const renderSvgPath = () => {
    if (!historicalData || historicalData.length < 2) {
      return null;
    }
    const min = Math.min(...historicalData);
    const max = Math.max(...historicalData);
    const range = max - min || 1;
    const width = 200;
    const height = 60;
    const padding = 5;

    const points = historicalData.map((val, idx) => {
      const x = (idx / (historicalData.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = `M ${points.join(" L ")}`;
    const areaPath = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;

    return { linePath, areaPath };
  };

  const svgPaths = renderSvgPath();

  if (!mainStockData) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="relative w-full aspect-[4/3] bg-[#050505] rounded-3xl border border-gray-800 shadow-2xl p-4 overflow-hidden flex text-[10px] text-gray-300">
      <div className="w-[140px] flex-shrink-0 border-r border-gray-800 pr-3 mr-3 space-y-6">
        <div className="text-sm font-bold text-white flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-bold text-[10px]">S</div>Signalist</div>
        <div className="space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Star, label: "Watchlist" },
            { icon: TrendingUp, label: "Markets" },
            { icon: Search, label: "Screener" },
            { icon: Newspaper, label: "News" },
            { icon: BrainCircuit, label: "AI Insights" },
            { icon: Wallet, label: "Portfolio" },
            { icon: Settings, label: "Settings" },
           ].map((i) => (
            <div key={i.label} className={`flex items-center gap-2 px-2 py-1.5 rounded ${i.active ? "bg-blue-600/20 text-blue-400" : "hover:text-white"}`}>
              <i.icon className="w-3.5 h-3.5" /> {i.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center bg-gray-800/50 rounded-lg px-2 py-1.5 gap-2 w-64">
            <Search className="w-3 h-3 text-gray-500" /> Search stocks, ETFs, or companies...
          </div>
          <div className="text-gray-500 text-right"><span className="text-green-500">● MARKET OPEN</span><br/>Mon, 15 Sep 2026 10:24 AM</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {indexesData.map((m) => (
            <div key={m.n} className="bg-gray-900 border border-gray-800 rounded-lg p-2 flex justify-between items-center">
              <div>
                <div className="text-[9px] text-gray-400">{m.n}</div>
                <div className="text-sm font-bold text-white">{m.price}</div>
                <div className={`text-[10px] ${m.pos ? "text-green-500" : "text-red-500"}`}>
                  {m.pos ? "↑" : "↓"} {m.change}%
                </div>
              </div>
              <svg width="30" height="20" viewBox="0 0 30 20" stroke={m.pos ? "#10b981" : "#ef4444"} fill="none"><path d="M0 15 C5 5, 10 18, 15 10 C20 2, 25 15, 30 5" strokeWidth="1.5"/></svg>
            </div>
          ))}
        </div>

        <div className="flex flex-1 gap-3 min-h-0">
          <div className="flex-[2] bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
              {mainStockData.logo ? (
                <img src={mainStockData.logo} alt={mainStockData.n} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black font-bold">{mainStockData.s[0]}</div>
              )}
                <div><div className="font-bold text-white">{mainStockData.s}</div><div className="text-[9px] text-gray-400 uppercase">{mainStockData.n}</div></div></div>
              <div className="text-right"><div className="text-lg font-bold text-white">{isLoading ? "---" : mainStockData.price}</div><div className={`text-[10px] ${mainStockData.pos ? "text-green-500" : "text-red-500"}`}>{isLoading ? "---" : mainStockData.change}</div></div>
            </div>
            <div className="flex-1 w-full bg-gray-800/20 rounded relative p-1 mt-2 mb-2 flex items-center justify-center">
              {isChartLoading ? (
                <div className="text-[9px] text-gray-500 animate-pulse">Loading real chart data...</div>
              ) : historicalData && historicalData.length > 0 && svgPaths ? (
                <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </linearGradient>
                  <path d={svgPaths.areaPath} fill="url(#g1)"/>
                  <path d={svgPaths.linePath} stroke="#3b82f6" strokeWidth="2" fill="none"/>
                </svg>
              ) : (
                <div className="text-[9px] text-red-500">Historical chart unavailable</div>
              )}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500">
              {["1D", "1W", "1M", "6M", "1Y"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartRange(t)}
                  className={`transition-colors ${chartRange === t ? "text-blue-500 font-extrabold" : "hover:text-gray-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-gray-800 text-center"><div className="text-[9px] text-gray-400">Vol<br/><span className="text-white">N/A</span></div><div className="text-[9px] text-gray-400">Cap<br/><span className="text-white">N/A</span></div><div className="text-[9px] text-gray-400">P/E<br/><span className="text-white">N/A</span></div><div className="text-[9px] text-gray-400">52W<br/><span className="text-white">N/A</span></div></div>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex justify-between mb-2 text-[10px] font-bold text-white">Top Movers</div>
              {moversData.map(m => (
                <div key={m.s} onClick={() => setSelectedSymbol(m.s)} className={`flex justify-between items-center py-1 border-b border-gray-800 last:border-0 text-[10px] cursor-pointer hover:bg-gray-800 rounded-sm ${selectedSymbol === m.s ? 'bg-gray-800' : ''}`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {m.logo ? (
                      <img src={m.logo} alt={m.n} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-gray-700 flex items-center justify-center text-[8px] text-white">
                        {m.s[0]}
                      </div>
                    )}
                    <span className="font-bold text-white w-8 flex-shrink-0">{m.s}</span>
                    <span className="text-gray-500 truncate flex-1">{m.n}</span>
                  </div>
                  <span className={m.changePercent >= 0 ? "text-green-500 font-bold ml-2" : "text-red-500 font-bold ml-2"}>{m.changeStr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
