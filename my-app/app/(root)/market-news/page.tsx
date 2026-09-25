import { getNews } from "@/lib/actions/finnhub.actions";
import MarketNewsClient from "@/components/market-news/MarketNewsClient";

export default async function MarketNewsPage() {
  // Initial fetch for the default "Market" category
  const initialNews = await getNews([], "Market");

  return (
    <div className="container mx-auto py-6 px-4">
      <MarketNewsClient initialNews={initialNews} />
    </div>
  );
}
