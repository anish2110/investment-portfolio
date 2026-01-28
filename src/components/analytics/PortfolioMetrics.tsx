"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    TrendingUp,
    PieChart,
    AlertTriangle,
    Target,
    BarChart3,
    Layers,
    Scale,
    Briefcase,
    LineChart,
} from "lucide-react";
import type { Holding, PortfolioMetrics as Metrics } from "@/lib/types";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { getSector, getAllSectors } from "@/lib/sectors";
import type { AssetTypeFilter } from "@/app/page";

interface PortfolioMetricsProps {
    holdings: Holding[];
    allHoldings?: Holding[];
    assetTypeFilter?: AssetTypeFilter;
}

export function PortfolioMetrics({ holdings, allHoldings, assetTypeFilter = "all" }: PortfolioMetricsProps) {
    // Asset type breakdown (using allHoldings if available, otherwise holdings)
    const assetBreakdown = useMemo(() => {
        const source = allHoldings || holdings;
        const stocks = source.filter((h) => h.type === "equity");
        const mfs = source.filter((h) => h.type === "mf");

        const stocksInvestment = stocks.reduce((sum, h) => sum + h.quantity * h.average_price, 0);
        const stocksValue = stocks.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
        const stocksPnl = stocks.reduce((sum, h) => sum + h.pnl, 0);

        const mfsInvestment = mfs.reduce((sum, h) => sum + h.quantity * h.average_price, 0);
        const mfsValue = mfs.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
        const mfsPnl = mfs.reduce((sum, h) => sum + h.pnl, 0);

        return {
            stocks: { count: stocks.length, investment: stocksInvestment, value: stocksValue, pnl: stocksPnl },
            mfs: { count: mfs.length, investment: mfsInvestment, value: mfsValue, pnl: mfsPnl },
            total: { count: source.length, value: stocksValue + mfsValue },
        };
    }, [allHoldings, holdings]);

    const metrics = useMemo<Metrics>(() => {
        const totalInvestment = holdings.reduce(
            (sum, h) => sum + h.quantity * h.average_price,
            0
        );
        const currentValue = holdings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );
        const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);
        const totalPnlPercentage =
            totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

        // Day change (mock since API doesn't provide this)
        const dayChange = holdings.reduce(
            (sum, h) => sum + (h.day_change || 0) * h.quantity,
            0
        );
        const dayChangePercentage =
            currentValue > 0 ? (dayChange / currentValue) * 100 : 0;

        // Top gainer/loser
        const withPercentage = holdings.map((h) => ({
            ...h,
            pnlPercentage:
                h.average_price > 0
                    ? ((h.last_price - h.average_price) / h.average_price) * 100
                    : 0,
        }));
        const sorted = [...withPercentage].sort(
            (a, b) => b.pnlPercentage - a.pnlPercentage
        );
        const topGainer = sorted[0] || null;
        const topLoser = sorted[sorted.length - 1] || null;

        // Sectors analysis
        const sectorCounts = new Set(holdings.map((h) => h.sector || getSector(h.tradingsymbol)));
        const numberOfSectors = sectorCounts.size;

        // Concentration risk (Herfindahl Index)
        const holdingValues = holdings.map((h) => h.quantity * h.last_price);
        const totalVal = holdingValues.reduce((sum, v) => sum + v, 0);
        const weights = holdingValues.map((v) => v / totalVal);
        const hhi = weights.reduce((sum, w) => sum + w * w, 0);
        const concentrationRisk = hhi * 100;

        // Diversification score (inverse of concentration)
        const maxDiversification = 100 / holdings.length;
        const diversificationScore = Math.min(
            100,
            ((1 - hhi) / (1 - maxDiversification / 100)) * 100
        );

        // Largest holding
        const sortedByValue = [...holdings].sort(
            (a, b) => b.quantity * b.last_price - a.quantity * a.last_price
        );
        const largestHolding = sortedByValue[0]
            ? {
                holding: sortedByValue[0],
                percentage:
                    ((sortedByValue[0].quantity * sortedByValue[0].last_price) /
                        currentValue) *
                    100,
            }
            : null;

        // Top 5 concentration
        const top5Value = sortedByValue
            .slice(0, 5)
            .reduce((sum, h) => sum + h.quantity * h.last_price, 0);
        const top5Concentration = currentValue > 0 ? (top5Value / currentValue) * 100 : 0;

        return {
            totalInvestment,
            currentValue,
            totalPnl,
            totalPnlPercentage,
            dayChange,
            dayChangePercentage,
            topGainer,
            topLoser,
            diversificationScore,
            concentrationRisk,
            numberOfStocks: holdings.length,
            numberOfSectors,
            largestHolding,
            top5Concentration,
        };
    }, [holdings]);

    const getRiskLevel = (concentration: number) => {
        if (concentration > 30) return { label: "High", color: "text-red-600" };
        if (concentration > 15) return { label: "Medium", color: "text-yellow-600" };
        return { label: "Low", color: "text-green-600" };
    };

    const riskLevel = getRiskLevel(metrics.concentrationRisk);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Investment */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                    <Wallet className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(metrics.totalInvestment)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Across {metrics.numberOfStocks} {assetTypeFilter === "mf" ? "funds" : assetTypeFilter === "equity" ? "stocks" : "holdings"}
                    </p>
                </CardContent>
            </Card>

            {/* Current Value */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                    <BarChart3 className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(metrics.currentValue)}
                    </div>
                    <p
                        className={cn(
                            "text-xs font-medium",
                            metrics.totalPnl >= 0 ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {metrics.totalPnl >= 0 ? "+" : ""}
                        {formatCurrency(metrics.totalPnl)} (
                        {formatPercentage(metrics.totalPnlPercentage)})
                    </p>
                </CardContent>
            </Card>

            {/* Total P&L */}
            <Card
                className={cn(
                    "border-2",
                    metrics.totalPnl >= 0
                        ? "border-green-200 dark:border-green-900"
                        : "border-red-200 dark:border-red-900"
                )}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                    <TrendingUp
                        className={cn(
                            "h-4 w-4",
                            metrics.totalPnl >= 0 ? "text-green-600" : "text-red-600"
                        )}
                    />
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            "text-2xl font-bold",
                            metrics.totalPnl >= 0 ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {metrics.totalPnl >= 0 ? "+" : ""}
                        {formatCurrency(metrics.totalPnl)}
                    </div>
                    <p
                        className={cn(
                            "text-xs font-medium",
                            metrics.totalPnl >= 0 ? "text-green-600" : "text-red-600"
                        )}
                    >
                        {formatPercentage(metrics.totalPnlPercentage)} returns
                    </p>
                </CardContent>
            </Card>

            {/* Sectors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Diversification</CardTitle>
                    <PieChart className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.numberOfSectors}</div>
                    <p className="text-muted-foreground text-xs">
                        sectors across {getAllSectors().length} possible
                    </p>
                </CardContent>
            </Card>

            {/* Concentration Risk */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Concentration Risk
                    </CardTitle>
                    <AlertTriangle className={cn("h-4 w-4", riskLevel.color)} />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                            {metrics.concentrationRisk.toFixed(1)}%
                        </span>
                        <Badge
                            variant={
                                riskLevel.label === "High"
                                    ? "destructive"
                                    : riskLevel.label === "Medium"
                                        ? "secondary"
                                        : "default"
                            }
                        >
                            {riskLevel.label}
                        </Badge>
                    </div>
                    <Progress
                        value={Math.min(metrics.concentrationRisk, 100)}
                        className="mt-2 h-2"
                    />
                </CardContent>
            </Card>

            {/* Largest Holding */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Largest Holding</CardTitle>
                    <Target className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    {metrics.largestHolding ? (
                        <>
                            <div className="text-2xl font-bold">
                                {metrics.largestHolding.holding.tradingsymbol}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {metrics.largestHolding.percentage.toFixed(1)}% of portfolio (
                                {formatCurrency(
                                    metrics.largestHolding.holding.quantity *
                                    metrics.largestHolding.holding.last_price
                                )}
                                )
                            </p>
                        </>
                    ) : (
                        <div className="text-muted-foreground text-sm">No holdings</div>
                    )}
                </CardContent>
            </Card>

            {/* Top 5 Concentration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Top 5 Concentration
                    </CardTitle>
                    <Layers className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.top5Concentration.toFixed(1)}%
                    </div>
                    <Progress
                        value={metrics.top5Concentration}
                        className="mt-2 h-2"
                    />
                    <p className="text-muted-foreground mt-1 text-xs">
                        of total portfolio in top 5 {assetTypeFilter === "mf" ? "funds" : "holdings"}
                    </p>
                </CardContent>
            </Card>

            {/* Diversification Score */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Diversification Score
                    </CardTitle>
                    <Scale className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                            {Math.max(0, metrics.diversificationScore).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-sm">/ 100</span>
                    </div>
                    <Progress
                        value={Math.max(0, metrics.diversificationScore)}
                        className="mt-2 h-2"
                    />
                </CardContent>
            </Card>

            {/* Asset Type Breakdown - Only show when viewing "all" */}
            {assetTypeFilter === "all" && assetBreakdown.stocks.count > 0 && assetBreakdown.mfs.count > 0 && (
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Asset Type Breakdown
                        </CardTitle>
                        <PieChart className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Stocks */}
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Stocks</span>
                                        <Badge variant="outline">{assetBreakdown.stocks.count}</Badge>
                                    </div>
                                    <div className="text-lg font-bold">
                                        {formatCurrency(assetBreakdown.stocks.value)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            {((assetBreakdown.stocks.value / assetBreakdown.total.value) * 100).toFixed(1)}% of portfolio
                                        </span>
                                        <span className={cn(
                                            "font-medium",
                                            assetBreakdown.stocks.pnl >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            {assetBreakdown.stocks.pnl >= 0 ? "+" : ""}{formatCurrency(assetBreakdown.stocks.pnl)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Mutual Funds */}
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                    <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Mutual Funds</span>
                                        <Badge variant="outline">{assetBreakdown.mfs.count}</Badge>
                                    </div>
                                    <div className="text-lg font-bold">
                                        {formatCurrency(assetBreakdown.mfs.value)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            {((assetBreakdown.mfs.value / assetBreakdown.total.value) * 100).toFixed(1)}% of portfolio
                                        </span>
                                        <span className={cn(
                                            "font-medium",
                                            assetBreakdown.mfs.pnl >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            {assetBreakdown.mfs.pnl >= 0 ? "+" : ""}{formatCurrency(assetBreakdown.mfs.pnl)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
