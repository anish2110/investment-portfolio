"use client";

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PieChart,
  BarChart3,
  Table2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Shield,
  Lightbulb,
  Calculator,
  Briefcase,
  LineChart,
  Layers,
  Brain,
} from "lucide-react";
import {
  SectorAllocation,
  TopMovers,
  PortfolioMetrics,
  HoldingsHeatmap,
  PerformanceComparison,
  DiversificationRadar,
  HoldingsTable,
  RiskAnalysis,
  InvestmentInsights,
  CostBasisAnalysis,
  AIAnalysis,
} from "@/components/analytics";
import type { Holding } from "@/lib/types";
import { getMutualFundCategory } from "@/lib/sectors";

export type AssetTypeFilter = "all" | "equity" | "mf";

export default function Dashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [usdInrRate, setUsdInrRate] = useState<number>(87.5);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      setError(null);

      const timestamp = new Date().getTime();
      const [equityRes, mfRes, vestedRes, rateRes] = await Promise.all([
        fetch(`/api/zerodha/holdings?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/zerodha/mutual-funds?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/vested/holdings?t=${timestamp}`, { cache: 'no-store' }),
        fetch('https://api.exchangerate-api.com/v4/latest/USD').catch(() => null)
      ]);

      if (!equityRes.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const equityData = await equityRes.json();
      let mfData = { data: [] };
      let vestedData = { data: [] };

      if (mfRes.ok) {
        try {
          mfData = await mfRes.json();
        } catch (e) {
          console.warn("Failed to parse mutual funds data", e);
        }
      }

      if (vestedRes.ok) {
        try {
          vestedData = await vestedRes.json();
          console.log("Frontend: Vested data received", vestedData);
        } catch (e) {
          console.warn("Failed to parse vested data", e);
        }
      } else {
        console.error("Frontend: Vested API response not OK", vestedRes.status);
      }

      const equityHoldings = (equityData.data || []).map((h: any) => ({
        ...h,
        type: 'equity' as const,
        currency: 'INR'
      }));

      const mfHoldings = (mfData.data || []).map((h: any) => ({
        ...h,
        type: 'mf' as const,
        tradingsymbol: h.fund || h.tradingsymbol,
        sector: getMutualFundCategory(h.fund || h.tradingsymbol),
        pnl: h.pnl || ((h.last_price - h.average_price) * h.quantity),
        currency: 'INR'
      }));

      let USD_INR_RATE = 87.5;
      if (rateRes && rateRes.ok) {
        try {
          const rateData = await rateRes.json();
          USD_INR_RATE = rateData.rates.INR || 87.5;
          setUsdInrRate(USD_INR_RATE);
        } catch (e) {
          console.warn("Failed to parse rate data", e);
        }
      }

      const vestedHoldings = (vestedData.data || []).map((h: any) => ({
        ...h,
        type: 'equity' as const, // Treat as equity
        // Convert strict financial values to INR for aggregation
        average_price: h.average_price * USD_INR_RATE,
        last_price: h.last_price * USD_INR_RATE,
        pnl: h.pnl * USD_INR_RATE,
        day_change: h.day_change * USD_INR_RATE,
        // Keep original currency info (optional, if we want to show it later)
        currency: 'USD',
        original_currency: 'USD',
        exchange: 'US'
      }));

      setHoldings([...equityHoldings, ...mfHoldings, ...vestedHoldings]);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Filter holdings based on asset type
  const filteredHoldings = useMemo(() => {
    if (assetTypeFilter === "all") return holdings;
    return holdings.filter((h) => h.type === assetTypeFilter);
  }, [holdings, assetTypeFilter]);

  // Stats for the filter tabs
  const assetStats = useMemo(() => {
    const stocks = holdings.filter((h) => h.type === "equity");
    const mfs = holdings.filter((h) => h.type === "mf");

    const stocksValue = stocks.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
    const mfsValue = mfs.reduce((sum, h) => sum + h.quantity * h.last_price, 0);

    return {
      stocksCount: stocks.length,
      mfsCount: mfs.length,
      stocksValue,
      mfsValue,
      totalValue: stocksValue + mfsValue,
    };
  }, [holdings]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-semibold">Failed to Load Portfolio</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchHoldings}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
        <TrendingUp className="text-muted-foreground h-16 w-16" />
        <h2 className="text-2xl font-semibold">No Holdings Found</h2>
        <p className="text-muted-foreground">
          Your portfolio is empty. Start investing to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Investment Portfolio
            </h1>
            <p className="text-muted-foreground text-sm">
              Analytics & Performance Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-muted-foreground text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={fetchHoldings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Asset Type Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Show:</span>
            <div className="inline-flex rounded-lg border bg-muted p-1">
              <Button
                variant={assetTypeFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAssetTypeFilter("all")}
                className={cn(
                  "gap-2 transition-all",
                  assetTypeFilter === "all" && "bg-primary/10 text-primary border-primary dark:bg-primary/20 font-semibold"
                )}
              >
                <Layers className="h-4 w-4" />
                All
                <Badge variant="outline" className="ml-1">
                  {holdings.length}
                </Badge>
              </Button>
              <Button
                variant={assetTypeFilter === "equity" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAssetTypeFilter("equity")}
                className={cn(
                  "gap-2 transition-all",
                  assetTypeFilter === "equity" && "bg-primary/10 text-primary border-primary dark:bg-primary/20 font-semibold"
                )}
              >
                <Briefcase className="h-4 w-4" />
                Stocks
                <Badge variant="outline" className="ml-1">
                  {assetStats.stocksCount}
                </Badge>
              </Button>
              <Button
                variant={assetTypeFilter === "mf" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAssetTypeFilter("mf")}
                className={cn(
                  "gap-2 transition-all",
                  assetTypeFilter === "mf" && "bg-primary/10 text-primary border-primary dark:bg-primary/20 font-semibold"
                )}
              >
                <LineChart className="h-4 w-4" />
                Mutual Funds
                <Badge variant="outline" className="ml-1">
                  {assetStats.mfsCount}
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {/* <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Analysis</span>
            </TabsTrigger> */}
            <TabsTrigger value="sectors" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Sectors</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="cost" className="gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cost Basis</span>
            </TabsTrigger>
            <TabsTrigger value="holdings" className="gap-2">
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">Holdings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <PortfolioMetrics holdings={filteredHoldings} allHoldings={holdings} assetTypeFilter={assetTypeFilter} />
            <div className="grid gap-6 xl:grid-cols-2">
              <HoldingsHeatmap holdings={filteredHoldings} />
              <SectorAllocation holdings={filteredHoldings} assetTypeFilter={assetTypeFilter} />
            </div>
            <TopMovers holdings={filteredHoldings} />
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-6">
            <AIAnalysis holdings={filteredHoldings} />
          </TabsContent>

          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-6">
            <SectorAllocation holdings={filteredHoldings} assetTypeFilter={assetTypeFilter} />
            <DiversificationRadar holdings={filteredHoldings} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              <PerformanceComparison holdings={filteredHoldings} />
              <div className="grid gap-6 lg:grid-cols-2">
                <HoldingsHeatmap holdings={filteredHoldings} />
                <DiversificationRadar holdings={filteredHoldings} />
              </div>
            </div>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-6">
            <RiskAnalysis holdings={filteredHoldings} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <InvestmentInsights holdings={filteredHoldings} />
          </TabsContent>

          {/* Cost Basis Tab */}
          <TabsContent value="cost" className="space-y-6">
            <CostBasisAnalysis holdings={filteredHoldings} />
          </TabsContent>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            <HoldingsTable holdings={filteredHoldings} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Investment Portfolio Analytics • Data from Zerodha & Vested</p>
          <p className="mt-1">
            Showing: <Badge variant="secondary">{filteredHoldings.length}</Badge> of {holdings.length} holdings
            (Vested: {holdings.filter(h => h.sector === 'International').length}) • USD/INR: ₹{usdInrRate.toFixed(2)}
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Skeleton className="h-10 w-[600px]" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
