"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertTriangle,
    Shield,
    TrendingUp,
    TrendingDown,
    Info,
    Target,
    Scale,
    BarChart3,
    PieChart,
    Zap,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { getSector, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { StockDetailModal } from "./StockDetailModal";

interface RiskAnalysisProps {
    holdings: Holding[];
}

interface RiskMetrics {
    // Portfolio-level metrics
    herfindahlIndex: number;
    effectiveDiversification: number;
    sectorConcentration: number;
    top5Concentration: number;
    top10Concentration: number;

    // Risk scores
    concentrationRisk: "Low" | "Medium" | "High";
    diversificationScore: number;
    overallRiskScore: number;

    // Stock-level metrics
    stockRisks: Array<{
        symbol: string;
        sector: string;
        weight: number;
        contribution: number; // Contribution to portfolio risk
        isOverweight: boolean;
        riskLevel: "Low" | "Medium" | "High";
        holding: Holding;
    }>;

    // Sector-level metrics
    sectorRisks: Array<{
        sector: string;
        weight: number;
        stockCount: number;
        avgStockWeight: number;
        maxStockWeight: number;
        riskLevel: "Low" | "Medium" | "High";
        color: string;
    }>;
}

export function RiskAnalysis({ holdings }: RiskAnalysisProps) {
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);

    const metrics = useMemo<RiskMetrics>(() => {
        const totalValue = holdings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );

        // Calculate weights
        const stockWeights = holdings.map((h) => ({
            symbol: h.tradingsymbol,
            sector: h.sector || getSector(h.tradingsymbol),
            weight: totalValue > 0 ? ((h.quantity * h.last_price) / totalValue) * 100 : 0,
            value: h.quantity * h.last_price,
            holding: h,
        }));

        // Herfindahl Index (sum of squared weights)
        const hhi = stockWeights.reduce((sum, s) => sum + Math.pow(s.weight / 100, 2), 0);
        const herfindahlIndex = hhi * 100;

        // Effective diversification (1/HHI gives effective number of equal-weighted stocks)
        const effectiveDiversification = hhi > 0 ? 1 / hhi : holdings.length;

        // Sector concentration
        const sectorWeights: Record<string, number> = {};
        stockWeights.forEach((s) => {
            sectorWeights[s.sector] = (sectorWeights[s.sector] || 0) + s.weight;
        });
        const maxSectorWeight = Math.max(...Object.values(sectorWeights), 0);

        // Top N concentration
        const sortedByWeight = [...stockWeights].sort((a, b) => b.weight - a.weight);
        const top5Concentration = sortedByWeight.slice(0, 5).reduce((sum, s) => sum + s.weight, 0);
        const top10Concentration = sortedByWeight.slice(0, 10).reduce((sum, s) => sum + s.weight, 0);

        // Risk scores
        const concentrationRisk: "Low" | "Medium" | "High" =
            herfindahlIndex > 30 ? "High" : herfindahlIndex > 15 ? "Medium" : "Low";

        const diversificationScore = Math.min(100, Math.max(0,
            100 - herfindahlIndex - (maxSectorWeight > 30 ? 20 : 0)
        ));

        const overallRiskScore = Math.min(100, Math.max(0,
            herfindahlIndex + (maxSectorWeight > 40 ? 15 : 0) + (top5Concentration > 60 ? 10 : 0)
        ));

        // Stock-level risks
        const stockRisks = stockWeights.map((s) => ({
            symbol: s.symbol,
            sector: s.sector,
            weight: s.weight,
            contribution: Math.pow(s.weight / 100, 2) * 100 / hhi * 100, // Contribution to HHI
            isOverweight: s.weight > 10,
            riskLevel: s.weight > 15 ? "High" as const : s.weight > 8 ? "Medium" as const : "Low" as const,
            holding: s.holding,
        })).sort((a, b) => b.weight - a.weight);

        // Sector-level risks
        const sectorData: Record<string, {
            weight: number;
            stocks: typeof stockWeights;
        }> = {};

        stockWeights.forEach((s) => {
            if (!sectorData[s.sector]) {
                sectorData[s.sector] = { weight: 0, stocks: [] };
            }
            sectorData[s.sector].weight += s.weight;
            sectorData[s.sector].stocks.push(s);
        });

        const sectorRisks = Object.entries(sectorData)
            .map(([sector, data]) => ({
                sector,
                weight: data.weight,
                stockCount: data.stocks.length,
                avgStockWeight: data.weight / data.stocks.length,
                maxStockWeight: Math.max(...data.stocks.map(s => s.weight)),
                riskLevel: data.weight > 30 ? "High" as const : data.weight > 20 ? "Medium" as const : "Low" as const,
                color: sectorColors[sector as Sector],
            }))
            .sort((a, b) => b.weight - a.weight);

        return {
            herfindahlIndex,
            effectiveDiversification,
            sectorConcentration: maxSectorWeight,
            top5Concentration,
            top10Concentration,
            concentrationRisk,
            diversificationScore,
            overallRiskScore,
            stockRisks,
            sectorRisks,
        };
    }, [holdings]);

    const getRiskColor = (risk: "Low" | "Medium" | "High") => {
        switch (risk) {
            case "Low": return "text-green-600";
            case "Medium": return "text-yellow-600";
            case "High": return "text-red-600";
        }
    };

    const getRiskBg = (risk: "Low" | "Medium" | "High") => {
        switch (risk) {
            case "Low": return "bg-green-50 dark:bg-green-950/30";
            case "Medium": return "bg-yellow-50 dark:bg-yellow-950/30";
            case "High": return "bg-red-50 dark:bg-red-950/30";
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Portfolio Risk Analysis
                        <Badge
                            variant={
                                metrics.concentrationRisk === "Low" ? "default" :
                                    metrics.concentrationRisk === "Medium" ? "secondary" : "destructive"
                            }
                        >
                            {metrics.concentrationRisk} Risk
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="stocks">Stock Risks</TabsTrigger>
                            <TabsTrigger value="sectors">Sector Risks</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Key Metrics Grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-lg border p-4 space-y-2 cursor-help">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Concentration Index</span>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {metrics.herfindahlIndex.toFixed(1)}%
                                                </div>
                                                <Progress
                                                    value={Math.min(metrics.herfindahlIndex, 100)}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Herfindahl-Hirschman Index measures concentration. Lower is more diversified.
                                                Under 15% = Low, 15-30% = Medium, Over 30% = High concentration.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-lg border p-4 space-y-2 cursor-help">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Effective Stocks</span>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {metrics.effectiveDiversification.toFixed(1)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    of {holdings.length} actual stocks
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Effective diversification: If your portfolio behaved as if it had
                                                this many equal-weighted stocks. Closer to actual count is better.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-lg border p-4 space-y-2 cursor-help">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Top 5 Concentration</span>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {metrics.top5Concentration.toFixed(1)}%
                                                </div>
                                                <Progress
                                                    value={metrics.top5Concentration}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Percentage of portfolio in top 5 holdings.
                                                Very high (&gt;60%) indicates dependency on few stocks.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-lg border p-4 space-y-2 cursor-help">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Max Sector Weight</span>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {metrics.sectorConcentration.toFixed(1)}%
                                                </div>
                                                <Progress
                                                    value={metrics.sectorConcentration}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Largest sector allocation. High concentration in one sector
                                                increases vulnerability to sector-specific risks.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Risk Scores */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className={cn("rounded-lg border p-4", getRiskBg(
                                    metrics.diversificationScore >= 70 ? "Low" :
                                        metrics.diversificationScore >= 40 ? "Medium" : "High"
                                ))}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Scale className="h-4 w-4" />
                                        <span className="font-medium">Diversification Score</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-bold">{metrics.diversificationScore.toFixed(0)}</div>
                                        <div className="flex-1">
                                            <Progress value={metrics.diversificationScore} className="h-3" />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Poor</span>
                                                <span>Excellent</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn("rounded-lg border p-4", getRiskBg(
                                    metrics.overallRiskScore <= 25 ? "Low" :
                                        metrics.overallRiskScore <= 50 ? "Medium" : "High"
                                ))}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-medium">Concentration Risk Score</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-bold">{metrics.overallRiskScore.toFixed(0)}</div>
                                        <div className="flex-1">
                                            <Progress value={metrics.overallRiskScore} className="h-3" />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Low Risk</span>
                                                <span>High Risk</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Warnings */}
                            <div className="space-y-3">
                                {metrics.herfindahlIndex > 25 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 p-4">
                                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                                        <div>
                                            <div className="font-medium text-red-800 dark:text-red-400">
                                                High Concentration Risk
                                            </div>
                                            <div className="text-sm text-red-700 dark:text-red-500">
                                                Your portfolio is heavily concentrated. Consider spreading investments
                                                across more stocks to reduce single-stock risk.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {metrics.top5Concentration > 60 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                                        <div>
                                            <div className="font-medium text-yellow-800 dark:text-yellow-400">
                                                Top 5 Holdings Dominate
                                            </div>
                                            <div className="text-sm text-yellow-700 dark:text-yellow-500">
                                                {metrics.top5Concentration.toFixed(0)}% of your portfolio is in just 5 stocks.
                                                Consider rebalancing to reduce this concentration.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {metrics.sectorConcentration > 35 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 p-4">
                                        <PieChart className="h-5 w-5 text-orange-600 shrink-0" />
                                        <div>
                                            <div className="font-medium text-orange-800 dark:text-orange-400">
                                                Sector Concentration Alert
                                            </div>
                                            <div className="text-sm text-orange-700 dark:text-orange-500">
                                                Your largest sector represents {metrics.sectorConcentration.toFixed(0)}% of the portfolio.
                                                Consider diversifying across other sectors.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {metrics.concentrationRisk === "Low" && metrics.sectorConcentration < 30 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 p-4">
                                        <Shield className="h-5 w-5 text-green-600 shrink-0" />
                                        <div>
                                            <div className="font-medium text-green-800 dark:text-green-400">
                                                Well Diversified Portfolio
                                            </div>
                                            <div className="text-sm text-green-700 dark:text-green-500">
                                                Your portfolio has good diversification across stocks and sectors.
                                                Continue maintaining this balanced approach.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Stock Risks Tab */}
                        <TabsContent value="stocks">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Sector</TableHead>
                                            <TableHead className="text-right">Weight</TableHead>
                                            <TableHead className="text-right">Risk Contribution</TableHead>
                                            <TableHead className="text-center">Risk Level</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.stockRisks.slice(0, 20).map((stock) => (
                                            <TableRow
                                                key={stock.symbol}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    setSelectedStock(stock.holding);
                                                    setStockModalOpen(true);
                                                }}
                                            >
                                                <TableCell className="font-semibold">
                                                    {stock.symbol}
                                                    {stock.isOverweight && (
                                                        <AlertTriangle className="h-3 w-3 text-yellow-600 ml-1 inline" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        style={{
                                                            borderColor: sectorColors[stock.sector as Sector],
                                                            color: sectorColors[stock.sector as Sector],
                                                        }}
                                                    >
                                                        {stock.sector}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Progress
                                                            value={stock.weight}
                                                            className="h-2 w-16"
                                                        />
                                                        <span className="w-14 text-right">{stock.weight.toFixed(1)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.contribution.toFixed(1)}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            stock.riskLevel === "Low" ? "default" :
                                                                stock.riskLevel === "Medium" ? "secondary" : "destructive"
                                                        }
                                                    >
                                                        {stock.riskLevel}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-center text-muted-foreground text-xs mt-2">
                                Click on any stock to view detailed analysis
                            </p>
                        </TabsContent>

                        {/* Sector Risks Tab */}
                        <TabsContent value="sectors">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sector</TableHead>
                                            <TableHead className="text-right">Weight</TableHead>
                                            <TableHead className="text-right">Stocks</TableHead>
                                            <TableHead className="text-right">Avg Stock Weight</TableHead>
                                            <TableHead className="text-right">Max Stock Weight</TableHead>
                                            <TableHead className="text-center">Risk Level</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.sectorRisks.map((sector) => (
                                            <TableRow key={sector.sector}>
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: sector.color }}
                                                        />
                                                        {sector.sector}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Progress
                                                            value={sector.weight}
                                                            className="h-2 w-16"
                                                        />
                                                        <span className="w-14 text-right">{sector.weight.toFixed(1)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{sector.stockCount}</TableCell>
                                                <TableCell className="text-right">{sector.avgStockWeight.toFixed(1)}%</TableCell>
                                                <TableCell className="text-right">{sector.maxStockWeight.toFixed(1)}%</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            sector.riskLevel === "Low" ? "default" :
                                                                sector.riskLevel === "Medium" ? "secondary" : "destructive"
                                                        }
                                                    >
                                                        {sector.riskLevel}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
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
