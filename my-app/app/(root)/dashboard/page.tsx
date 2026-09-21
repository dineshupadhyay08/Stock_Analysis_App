export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Welcome */}
      <section className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Dinesh 👋
          </h1>

          <p className="mt-1 text-muted-foreground">
            Here's what's happening in the market today.
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Market Status
          </p>

          <div className="mt-1 flex items-center justify-end gap-2 text-sm font-medium text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Market Open
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MarketCard title="S&P 500" />
        <MarketCard title="Nasdaq" />
        <MarketCard title="Dow Jones" />
        <MarketCard title="Russell 2000" />
      </section>

      {/* Heatmap + Movers */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">

        <DashboardCard title="Stock Heatmap">
          <div className="grid min-h-[280px] grid-cols-4 gap-1 rounded-xl bg-muted/20 p-1">
            {[
              "AAPL",
              "MSFT",
              "NVDA",
              "GOOGL",
              "AMZN",
              "TSLA",
              "META",
              "ORCL",
              "JPM",
              "V",
              "WMT",
              "AMD",
            ].map((symbol, index) => (
              <div
                key={symbol}
                className={`flex items-center justify-center rounded-lg text-sm font-semibold text-white ${
                  index % 3 === 0
                    ? "bg-red-500/80"
                    : "bg-emerald-500/80"
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Top Gainers">
          <MoverList positive />
        </DashboardCard>

        <DashboardCard title="Top Losers">
          <MoverList />
        </DashboardCard>

      </section>

      {/* Stories + Watchlist */}
      <section className="grid gap-4 xl:grid-cols-2">

        <DashboardCard title="Top Stories">
          <div className="space-y-3">
            <StoryItem title="Latest market movements and updates" />
            <StoryItem title="Technology stocks in focus" />
            <StoryItem title="Latest earnings and company news" />
          </div>
        </DashboardCard>

        <DashboardCard title="Your Watchlist">
          <EmptyState text="Your watchlist stocks will appear here." />
        </DashboardCard>

      </section>

      {/* Portfolio + Paper Trading */}
      <section className="grid gap-4 xl:grid-cols-2">

        <DashboardCard title="Portfolio">
          <EmptyState text="Your portfolio summary will appear here." />
        </DashboardCard>

        <DashboardCard title="Paper Trading">
          <EmptyState text="Your paper trading summary will appear here." />
        </DashboardCard>

      </section>

    </div>
  );
}


/* -------------------------------- */
/* Market Card */
/* -------------------------------- */

function MarketCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">

      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-bold">
          —
        </p>

        <div className="h-8 w-16 rounded-md bg-muted/40" />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Market data loading...
      </p>

    </div>
  );
}


/* -------------------------------- */
/* Dashboard Card */
/* -------------------------------- */

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>

      {children}

    </div>
  );
}


/* -------------------------------- */
/* Movers */
/* -------------------------------- */

function MoverList({
  positive = false,
}: {
  positive?: boolean;
}) {
  const stocks = positive
    ? ["NVDA", "AMZN", "TSLA", "AMD", "BABA"]
    : ["ORCL", "MSFT", "WFC", "BAC", "C"];

  return (
    <div className="space-y-3">

      {stocks.map((symbol) => (
        <div
          key={symbol}
          className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0"
        >
          <span className="font-medium">
            {symbol}
          </span>

          <span
            className={
              positive
                ? "text-sm font-medium text-emerald-500"
                : "text-sm font-medium text-red-500"
            }
          >
            —
          </span>
        </div>
      ))}

    </div>
  );
}


/* -------------------------------- */
/* Story */
/* -------------------------------- */

function StoryItem({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 p-4">

      <p className="text-sm font-medium">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Market Intelligence
      </p>

    </div>
  );
}


/* -------------------------------- */
/* Empty State */
/* -------------------------------- */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}