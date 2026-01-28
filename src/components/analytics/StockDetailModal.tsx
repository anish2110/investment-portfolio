"use client";

import { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    TrendingUp,
    TrendingDown,
    Target,
    PieChart,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Info,
    Wallet,
    Calculator,
    Calendar,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { getSector, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage, formatQuantity } from "@/lib/utils";

interface StockDetailModalProps {
    holding: Holding | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allHoldings: Holding[];
}

export function StockDetailModal({
    holding,
    open,
    onOpenChange,
    allHoldings,
}: StockDetailModalProps) {
    const analysis = useMemo(() => {
        if (!holding) return null;

        const sector = holding.sector || getSector(holding.tradingsymbol);
        const investment = holding.quantity * holding.average_price;
        const currentValue = holding.quantity * holding.last_price;
        const pnl = holding.pnl;
        const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;

        // Portfolio weight
        const totalPortfolioValue = allHoldings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );
        const portfolioWeight = totalPortfolioValue > 0
            ? (currentValue / totalPortfolioValue) * 100
            : 0;

        // Sector comparison
        const sectorHoldings = allHoldings.filter(
            (h) => (h.sector || getSector(h.tradingsymbol)) === sector
        );
        const sectorTotalValue = sectorHoldings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );
        const weightInSector = sectorTotalValue > 0
            ? (currentValue / sectorTotalValue) * 100
            : 0;

        // Performance ranking
        const allWithPnl = allHoldings.map((h) => ({
            symbol: h.tradingsymbol,
            pnlPct: h.average_price > 0
                ? ((h.last_price - h.average_price) / h.average_price) * 100
                : 0,
        })).sort((a, b) => b.pnlPct - a.pnlPct);

        const rank = allWithPnl.findIndex((h) => h.symbol === holding.tradingsymbol) + 1;

        // Price analysis
        const priceChange = holding.last_price - holding.average_price;
        const priceChangePercent = (priceChange / holding.average_price) * 100;

        // Risk assessment
        const isOverweight = portfolioWeight > 10;
        const isTopHolding = rank <= 5;
        const isSectorConcentrated = weightInSector > 50;

        return {
            sector,
            investment,
            currentValue,
            pnl,
            pnlPercentage,
            portfolioWeight,
            weightInSector,
            sectorTotalValue,
            sectorHoldingsCount: sectorHoldings.length,
            rank,
            totalHoldings: allHoldings.length,
            priceChange,
            priceChangePercent,
            isOverweight,
            isTopHolding,
            isSectorConcentrated,
            sectorColor: sectorColors[sector as Sector],
        };
    }, [holding, allHoldings]);

    if (!holding || !analysis) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span className="text-2xl">{holding.tradingsymbol}</span>
                        <Badge
                            style={{
                                backgroundColor: analysis.sectorColor + "20",
                                color: analysis.sectorColor,
                                borderColor: analysis.sectorColor,
                            }}
                        >
                            {analysis.sector}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="text-muted-foreground text-xs">Qty</div>
                            <div className="font-semibold">{formatQuantity(holding.quantity)}</div>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="text-muted-foreground text-xs">Avg Price</div>
                            <div className="font-semibold">{formatCurrency(holding.average_price)}</div>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="text-muted-foreground text-xs">LTP</div>
                            <div className="font-semibold">{formatCurrency(holding.last_price)}</div>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="text-muted-foreground text-xs">Price Change</div>
                            <div className={cn(
                                "font-semibold",
                                analysis.priceChange >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {analysis.priceChange >= 0 ? "+" : ""}
                                {formatPercentage(analysis.priceChangePercent)}
                            </div>
                        </div>
                    </div>

                    {/* P&L Card */}
                    <Card className={cn(
                        "border-2",
                        analysis.pnl >= 0 ? "border-green-200 dark:border-green-900" : "border-red-200 dark:border-red-900"
                    )}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-muted-foreground text-sm">Investment</div>
                                    <div className="text-xl font-semibold">{formatCurrency(analysis.investment)}</div>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2",
                                    analysis.pnl >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {analysis.pnl >= 0 ? (
                                        <TrendingUp className="h-5 w-5" />
                                    ) : (
                                        <TrendingDown className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-muted-foreground text-sm">Current Value</div>
                                    <div className="text-xl font-semibold">{formatCurrency(analysis.currentValue)}</div>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Profit/Loss</span>
                                <div className={cn(
                                    "text-xl font-bold",
                                    analysis.pnl >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {analysis.pnl >= 0 ? "+" : ""}{formatCurrency(analysis.pnl)}
                                    <span className="ml-2 text-sm">
                                        ({formatPercentage(analysis.pnlPercentage)})
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Portfolio Position */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                Portfolio Position
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Portfolio Weight</span>
                                    <span className="font-medium">{analysis.portfolioWeight.toFixed(2)}%</span>
                                </div>
                                <Progress value={analysis.portfolioWeight} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Weight in {analysis.sector}</span>
                                    <span className="font-medium">{analysis.weightInSector.toFixed(2)}%</span>
                                </div>
                                <Progress value={analysis.weightInSector} className="h-2" />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Performance Rank</span>
                                <Badge variant={analysis.rank <= 5 ? "default" : "secondary"}>
                                    #{analysis.rank} of {analysis.totalHoldings}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sector Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Sector Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-3">
                                    <div className="text-muted-foreground text-xs">Sector Holdings</div>
                                    <div className="text-lg font-semibold">{analysis.sectorHoldingsCount} stocks</div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="text-muted-foreground text-xs">Sector Value</div>
                                    <div className="text-lg font-semibold">{formatCurrency(analysis.sectorTotalValue)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Insights & Alerts */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analysis.isOverweight && (
                                <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-yellow-800 dark:text-yellow-400">Overweight Position</div>
                                        <div className="text-yellow-700 dark:text-yellow-500">
                                            This stock represents {analysis.portfolioWeight.toFixed(1)}% of your portfolio. Consider rebalancing if it exceeds your target allocation.
                                        </div>
                                    </div>
                                </div>
                            )}
                            {analysis.isSectorConcentrated && (
                                <div className="flex items-start gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-orange-800 dark:text-orange-400">Sector Concentration</div>
                                        <div className="text-orange-700 dark:text-orange-500">
                                            This stock makes up {analysis.weightInSector.toFixed(1)}% of your {analysis.sector} allocation. Consider diversifying within the sector.
                                        </div>
                                    </div>
                                </div>
                            )}
                            {analysis.isTopHolding && analysis.pnl > 0 && (
                                <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-green-800 dark:text-green-400">Top Performer</div>
                                        <div className="text-green-700 dark:text-green-500">
                                            Ranked #{analysis.rank} in your portfolio with {formatPercentage(analysis.pnlPercentage)} returns!
                                        </div>
                                    </div>
                                </div>
                            )}
                            {analysis.pnl < 0 && Math.abs(analysis.pnlPercentage) > 20 && (
                                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-red-800 dark:text-red-400">Significant Loss</div>
                                        <div className="text-red-700 dark:text-red-500">
                                            This stock is down {formatPercentage(Math.abs(analysis.pnlPercentage))}. Review your investment thesis or consider tax-loss harvesting if applicable.
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!analysis.isOverweight && !analysis.isSectorConcentrated && analysis.pnl >= 0 && (
                                <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-blue-800 dark:text-blue-400">Well Balanced</div>
                                        <div className="text-blue-700 dark:text-blue-500">
                                            This position is appropriately sized and well-balanced within your portfolio.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
