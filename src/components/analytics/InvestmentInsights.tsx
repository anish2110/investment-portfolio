"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowRight,
    Target,
    Shuffle,
    DollarSign,
    BarChart3,
    RefreshCw,
    Scale,
    PieChart,
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { getSector, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { StockDetailModal } from "./StockDetailModal";

interface InvestmentInsightsProps {
    holdings: Holding[];
}

interface Insight {
    id: string;
    type: "warning" | "opportunity" | "info" | "success";
    category: "rebalancing" | "performance" | "risk" | "tax" | "opportunity";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    actionable: boolean;
    stocks?: Holding[];
    metrics?: Record<string, number | string>;
}

export function InvestmentInsights({ holdings }: InvestmentInsightsProps) {
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "actionable" | "warnings">("all");

    const insights = useMemo<Insight[]>(() => {
        const results: Insight[] = [];
        const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
        const totalInvestment = holdings.reduce((sum, h) => sum + h.quantity * h.average_price, 0);

        // Calculate stock metrics
        const stockMetrics = holdings.map((h) => {
            const investment = h.quantity * h.average_price;
            const currentValue = h.quantity * h.last_price;
            const pnlPercentage = investment > 0 ? (h.pnl / investment) * 100 : 0;
            const weight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
            return {
                ...h,
                investment,
                currentValue,
                pnlPercentage,
                weight,
                sector: h.sector || getSector(h.tradingsymbol),
            };
        });

        // Sector analysis
        const sectorData: Record<string, {
            weight: number;
            stocks: typeof stockMetrics;
            pnl: number;
            investment: number;
        }> = {};
        stockMetrics.forEach((s) => {
            if (!sectorData[s.sector]) {
                sectorData[s.sector] = { weight: 0, stocks: [], pnl: 0, investment: 0 };
            }
            sectorData[s.sector].weight += s.weight;
            sectorData[s.sector].stocks.push(s);
            sectorData[s.sector].pnl += s.pnl;
            sectorData[s.sector].investment += s.investment;
        });

        // 1. Overweight positions
        const overweightStocks = stockMetrics.filter((s) => s.weight > 12);
        if (overweightStocks.length > 0) {
            results.push({
                id: "overweight-positions",
                type: "warning",
                category: "rebalancing",
                title: `${overweightStocks.length} Overweight Position${overweightStocks.length > 1 ? 's' : ''}`,
                description: `These stocks exceed 12% of your portfolio, creating concentration risk.`,
                impact: "high",
                actionable: true,
                stocks: overweightStocks,
                metrics: {
                    "Max Weight": `${Math.max(...overweightStocks.map(s => s.weight)).toFixed(1)}%`,
                    "Total Overweight": `${overweightStocks.reduce((sum, s) => sum + s.weight, 0).toFixed(1)}%`,
                },
            });
        }

        // 2. Top performers - potential profit booking
        const topPerformers = stockMetrics
            .filter((s) => s.pnlPercentage > 50 && s.currentValue > 10000)
            .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
            .slice(0, 5);
        if (topPerformers.length > 0) {
            results.push({
                id: "profit-booking",
                type: "opportunity",
                category: "opportunity",
                title: "Consider Profit Booking",
                description: `${topPerformers.length} stocks have gained over 50%. Consider booking partial profits to lock in gains.`,
                impact: "medium",
                actionable: true,
                stocks: topPerformers,
                metrics: {
                    "Avg Gain": `${(topPerformers.reduce((sum, s) => sum + s.pnlPercentage, 0) / topPerformers.length).toFixed(0)}%`,
                    "Total Profit": formatCurrency(topPerformers.reduce((sum, s) => sum + s.pnl, 0)),
                },
            });
        }

        // 3. Underperformers - review needed
        const underperformers = stockMetrics
            .filter((s) => s.pnlPercentage < -20)
            .sort((a, b) => a.pnlPercentage - b.pnlPercentage)
            .slice(0, 5);
        if (underperformers.length > 0) {
            results.push({
                id: "underperformers",
                type: "warning",
                category: "performance",
                title: "Underperforming Holdings",
                description: `${underperformers.length} stocks are down more than 20%. Review your investment thesis for these positions.`,
                impact: "high",
                actionable: true,
                stocks: underperformers,
                metrics: {
                    "Avg Loss": `${(underperformers.reduce((sum, s) => sum + s.pnlPercentage, 0) / underperformers.length).toFixed(0)}%`,
                    "Total Loss": formatCurrency(underperformers.reduce((sum, s) => sum + s.pnl, 0)),
                },
            });
        }

        // 4. Tax loss harvesting opportunities
        const taxLossStocks = stockMetrics
            .filter((s) => s.pnl < -5000)
            .sort((a, b) => a.pnl - b.pnl)
            .slice(0, 5);
        if (taxLossStocks.length > 0) {
            const totalLoss = taxLossStocks.reduce((sum, s) => sum + Math.abs(s.pnl), 0);
            results.push({
                id: "tax-loss",
                type: "info",
                category: "tax",
                title: "Tax Loss Harvesting Opportunity",
                description: `You have ${formatCurrency(totalLoss)} in unrealized losses that could be used to offset capital gains.`,
                impact: "medium",
                actionable: true,
                stocks: taxLossStocks,
                metrics: {
                    "Potential Tax Offset": formatCurrency(totalLoss * 0.15), // Assuming 15% LTCG
                    "Stocks Eligible": taxLossStocks.length.toString(),
                },
            });
        }

        // 5. Sector concentration
        const overweightSectors = Object.entries(sectorData)
            .filter(([_, data]) => data.weight > 30)
            .map(([sector, data]) => ({ sector, ...data }));
        if (overweightSectors.length > 0) {
            results.push({
                id: "sector-concentration",
                type: "warning",
                category: "risk",
                title: "Sector Concentration Risk",
                description: `${overweightSectors.map(s => s.sector).join(', ')} sector${overweightSectors.length > 1 ? 's' : ''} ${overweightSectors.length > 1 ? 'are' : 'is'} overweight (>30%). Consider diversifying.`,
                impact: "high",
                actionable: true,
                metrics: {
                    "Overweight Sectors": overweightSectors.length.toString(),
                    "Max Sector Weight": `${Math.max(...overweightSectors.map(s => s.weight)).toFixed(1)}%`,
                },
            });
        }

        // 6. Small positions to consolidate
        const smallPositions = stockMetrics
            .filter((s) => s.currentValue < 5000 && s.weight < 1)
            .sort((a, b) => a.currentValue - b.currentValue);
        if (smallPositions.length > 5) {
            results.push({
                id: "small-positions",
                type: "info",
                category: "rebalancing",
                title: "Consider Consolidating Small Positions",
                description: `You have ${smallPositions.length} positions under ₹5,000. Consider consolidating to simplify portfolio management.`,
                impact: "low",
                actionable: true,
                stocks: smallPositions.slice(0, 5),
                metrics: {
                    "Total Value": formatCurrency(smallPositions.reduce((sum, s) => sum + s.currentValue, 0)),
                    "Portfolio Weight": `${smallPositions.reduce((sum, s) => sum + s.weight, 0).toFixed(1)}%`,
                },
            });
        }

        // 7. Sector performance insights
        const sectorPerformance = Object.entries(sectorData)
            .map(([sector, data]) => ({
                sector,
                pnlPct: data.investment > 0 ? (data.pnl / data.investment) * 100 : 0,
                ...data,
            }))
            .sort((a, b) => b.pnlPct - a.pnlPct);

        const bestSector = sectorPerformance[0];
        const worstSector = sectorPerformance[sectorPerformance.length - 1];

        if (bestSector && bestSector.pnlPct > 20) {
            results.push({
                id: "best-sector",
                type: "success",
                category: "performance",
                title: `${bestSector.sector} is Your Best Performing Sector`,
                description: `Your ${bestSector.sector} holdings are up ${bestSector.pnlPct.toFixed(0)}% overall.`,
                impact: "low",
                actionable: false,
                stocks: bestSector.stocks.slice(0, 3),
                metrics: {
                    "Sector Return": `+${bestSector.pnlPct.toFixed(1)}%`,
                    "Sector Weight": `${bestSector.weight.toFixed(1)}%`,
                },
            });
        }

        if (worstSector && worstSector.pnlPct < -10) {
            results.push({
                id: "worst-sector",
                type: "warning",
                category: "performance",
                title: `${worstSector.sector} Needs Attention`,
                description: `Your ${worstSector.sector} holdings are down ${Math.abs(worstSector.pnlPct).toFixed(0)}%. Review individual positions.`,
                impact: "medium",
                actionable: true,
                stocks: worstSector.stocks.slice(0, 3),
                metrics: {
                    "Sector Return": `${worstSector.pnlPct.toFixed(1)}%`,
                    "Sector Weight": `${worstSector.weight.toFixed(1)}%`,
                },
            });
        }

        // 8. Portfolio health check
        const profitableStocks = stockMetrics.filter((s) => s.pnl > 0).length;
        const profitRatio = (profitableStocks / holdings.length) * 100;
        if (profitRatio >= 70) {
            results.push({
                id: "portfolio-health",
                type: "success",
                category: "performance",
                title: "Strong Portfolio Performance",
                description: `${profitRatio.toFixed(0)}% of your holdings are in profit. Your stock selection has been effective.`,
                impact: "low",
                actionable: false,
                metrics: {
                    "Profitable Stocks": `${profitableStocks} of ${holdings.length}`,
                    "Total P&L": formatCurrency(holdings.reduce((sum, h) => sum + h.pnl, 0)),
                },
            });
        } else if (profitRatio < 40) {
            results.push({
                id: "portfolio-concern",
                type: "warning",
                category: "performance",
                title: "Portfolio Health Concern",
                description: `Only ${profitRatio.toFixed(0)}% of your holdings are profitable. Consider reviewing your investment strategy.`,
                impact: "high",
                actionable: true,
                metrics: {
                    "Profitable Stocks": `${profitableStocks} of ${holdings.length}`,
                    "Losing Stocks": `${holdings.length - profitableStocks}`,
                },
            });
        }

        // 9. Rebalancing suggestion
        const avgWeight = 100 / holdings.length;
        const deviationSum = stockMetrics.reduce(
            (sum, s) => sum + Math.abs(s.weight - avgWeight),
            0
        );
        const avgDeviation = deviationSum / holdings.length;

        if (avgDeviation > 5) {
            results.push({
                id: "rebalancing",
                type: "info",
                category: "rebalancing",
                title: "Portfolio Rebalancing Recommended",
                description: `Your portfolio has significant weight deviations from equal allocation. Consider periodic rebalancing.`,
                impact: "medium",
                actionable: true,
                metrics: {
                    "Avg Deviation": `${avgDeviation.toFixed(1)}%`,
                    "Ideal Weight": `${avgWeight.toFixed(1)}%`,
                },
            });
        }

        // 10. Momentum stocks
        const momentumStocks = stockMetrics
            .filter((s) => s.pnlPercentage > 30 && s.pnlPercentage < 80)
            .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
            .slice(0, 5);
        if (momentumStocks.length >= 3) {
            results.push({
                id: "momentum",
                type: "success",
                category: "opportunity",
                title: "Strong Momentum Stocks",
                description: `${momentumStocks.length} stocks showing strong momentum (30-80% gains). Consider riding the trend.`,
                impact: "low",
                actionable: false,
                stocks: momentumStocks,
            });
        }

        return results.sort((a, b) => {
            const impactOrder = { high: 0, medium: 1, low: 2 };
            return impactOrder[a.impact] - impactOrder[b.impact];
        });
    }, [holdings]);

    const filteredInsights = useMemo(() => {
        switch (filter) {
            case "actionable":
                return insights.filter((i) => i.actionable);
            case "warnings":
                return insights.filter((i) => i.type === "warning");
            default:
                return insights;
        }
    }, [insights, filter]);

    const getTypeIcon = (type: Insight["type"]) => {
        switch (type) {
            case "warning": return <AlertTriangle className="h-5 w-5" />;
            case "opportunity": return <Lightbulb className="h-5 w-5" />;
            case "success": return <CheckCircle2 className="h-5 w-5" />;
            default: return <Zap className="h-5 w-5" />;
        }
    };

    const getTypeBg = (type: Insight["type"]) => {
        switch (type) {
            case "warning": return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900";
            case "opportunity": return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900";
            case "success": return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900";
            default: return "bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800";
        }
    };

    const getTypeTextColor = (type: Insight["type"]) => {
        switch (type) {
            case "warning": return "text-yellow-700 dark:text-yellow-400";
            case "opportunity": return "text-blue-700 dark:text-blue-400";
            case "success": return "text-green-700 dark:text-green-400";
            default: return "text-gray-700 dark:text-gray-400";
        }
    };

    const getCategoryIcon = (category: Insight["category"]) => {
        switch (category) {
            case "rebalancing": return <Scale className="h-3 w-3" />;
            case "performance": return <BarChart3 className="h-3 w-3" />;
            case "risk": return <AlertTriangle className="h-3 w-3" />;
            case "tax": return <DollarSign className="h-3 w-3" />;
            case "opportunity": return <Target className="h-3 w-3" />;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Investment Insights
                            <Badge variant="secondary">{insights.length} insights</Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === "actionable" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("actionable")}
                            >
                                Actionable
                            </Button>
                            <Button
                                variant={filter === "warnings" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("warnings")}
                            >
                                Warnings
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {filteredInsights.map((insight) => (
                                <div
                                    key={insight.id}
                                    className={cn(
                                        "rounded-lg border p-4",
                                        getTypeBg(insight.type)
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn("shrink-0 mt-0.5", getTypeTextColor(insight.type))}>
                                            {getTypeIcon(insight.type)}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className={cn("font-semibold", getTypeTextColor(insight.type))}>
                                                        {insight.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {insight.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant="outline" className="text-xs gap-1">
                                                        {getCategoryIcon(insight.category)}
                                                        {insight.category}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            insight.impact === "high" ? "destructive" :
                                                                insight.impact === "medium" ? "secondary" : "default"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {insight.impact} impact
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Metrics */}
                                            {insight.metrics && (
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {Object.entries(insight.metrics).map(([key, value]) => (
                                                        <div key={key}>
                                                            <span className="text-muted-foreground">{key}: </span>
                                                            <span className="font-medium">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Related Stocks */}
                                            {insight.stocks && insight.stocks.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {insight.stocks.map((stock) => (
                                                        <Button
                                                            key={stock.tradingsymbol}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs gap-1"
                                                            onClick={() => {
                                                                setSelectedStock(stock);
                                                                setStockModalOpen(true);
                                                            }}
                                                        >
                                                            {stock.tradingsymbol}
                                                            <ArrowRight className="h-3 w-3" />
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredInsights.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No insights match the selected filter
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <StockDetailModal
                holding={selectedStock}
                open={stockModalOpen}
                onOpenChange={setStockModalOpen}
                allHoldings={holdings}
            />
        </>
    );
}
