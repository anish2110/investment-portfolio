"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    IndianRupee,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { getSector, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { StockDetailModal } from "./StockDetailModal";

interface CostBasisAnalysisProps {
    holdings: Holding[];
}

interface StockCostAnalysis {
    symbol: string;
    sector: string;
    quantity: number;
    avgCost: number;
    currentPrice: number;
    totalCost: number;
    marketValue: number;
    unrealizedGain: number;
    unrealizedGainPct: number;
    gainType: "profit" | "loss";
    portfolioWeight: number;
    holding: Holding;
}

export function CostBasisAnalysis({ holdings }: CostBasisAnalysisProps) {
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);

    const analysis = useMemo(() => {
        const totalMarketValue = holdings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );

        const stocks: StockCostAnalysis[] = holdings.map((h) => {
            const totalCost = h.quantity * h.average_price;
            const marketValue = h.quantity * h.last_price;
            const unrealizedGain = h.pnl;
            const unrealizedGainPct = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;

            return {
                symbol: h.tradingsymbol,
                sector: h.sector || getSector(h.tradingsymbol),
                quantity: h.quantity,
                avgCost: h.average_price,
                currentPrice: h.last_price,
                totalCost,
                marketValue,
                unrealizedGain,
                unrealizedGainPct,
                gainType: unrealizedGain >= 0 ? "profit" : "loss",
                portfolioWeight: totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0,
                holding: h,
            };
        });

        // Summary calculations
        const totalCostBasis = stocks.reduce((sum, s) => sum + s.totalCost, 0);
        const totalUnrealizedGain = stocks.reduce((sum, s) => sum + s.unrealizedGain, 0);
        const totalUnrealizedGainPct = totalCostBasis > 0
            ? (totalUnrealizedGain / totalCostBasis) * 100
            : 0;

        // Profit/Loss breakdown
        const profitableStocks = stocks.filter((s) => s.unrealizedGain > 0);
        const losingStocks = stocks.filter((s) => s.unrealizedGain < 0);
        const totalProfits = profitableStocks.reduce((sum, s) => sum + s.unrealizedGain, 0);
        const totalLosses = losingStocks.reduce((sum, s) => sum + Math.abs(s.unrealizedGain), 0);

        // Tax implications (assuming 10% LTCG above ₹1L, 15% STCG)
        const ltcgExemption = 100000;
        const taxableLTCG = Math.max(0, totalProfits - ltcgExemption);
        const estimatedLTCGTax = taxableLTCG * 0.10; // 10% LTCG
        const potentialTaxSavings = Math.min(totalLosses, totalProfits) * 0.10; // Tax loss harvesting benefit

        // Sector breakdown
        const sectorBreakdown: Record<string, {
            totalCost: number;
            marketValue: number;
            unrealizedGain: number;
            gainPct: number;
            stockCount: number;
        }> = {};

        stocks.forEach((s) => {
            if (!sectorBreakdown[s.sector]) {
                sectorBreakdown[s.sector] = {
                    totalCost: 0,
                    marketValue: 0,
                    unrealizedGain: 0,
                    gainPct: 0,
                    stockCount: 0,
                };
            }
            sectorBreakdown[s.sector].totalCost += s.totalCost;
            sectorBreakdown[s.sector].marketValue += s.marketValue;
            sectorBreakdown[s.sector].unrealizedGain += s.unrealizedGain;
            sectorBreakdown[s.sector].stockCount += 1;
        });

        Object.values(sectorBreakdown).forEach((sector) => {
            sector.gainPct = sector.totalCost > 0
                ? (sector.unrealizedGain / sector.totalCost) * 100
                : 0;
        });

        return {
            stocks: stocks.sort((a, b) => b.marketValue - a.marketValue),
            totalCostBasis,
            totalMarketValue,
            totalUnrealizedGain,
            totalUnrealizedGainPct,
            profitableStocks,
            losingStocks,
            totalProfits,
            totalLosses,
            taxableLTCG,
            estimatedLTCGTax,
            potentialTaxSavings,
            sectorBreakdown,
        };
    }, [holdings]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Cost Basis Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="gains">Gains/Losses</TabsTrigger>
                            <TabsTrigger value="tax">Tax Impact</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Wallet className="h-4 w-4" />
                                        Total Cost Basis
                                    </div>
                                    <div className="text-2xl font-bold mt-2">
                                        {formatCurrency(analysis.totalCostBasis)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Original investment amount
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <IndianRupee className="h-4 w-4" />
                                        Current Value
                                    </div>
                                    <div className="text-2xl font-bold mt-2">
                                        {formatCurrency(analysis.totalMarketValue)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Market value today
                                    </div>
                                </div>

                                <div className={cn(
                                    "rounded-lg border p-4",
                                    analysis.totalUnrealizedGain >= 0
                                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
                                        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                                )}>
                                    <div className={cn(
                                        "flex items-center gap-2 text-sm",
                                        analysis.totalUnrealizedGain >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                    )}>
                                        {analysis.totalUnrealizedGain >= 0 ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                        Unrealized Gain
                                    </div>
                                    <div className={cn(
                                        "text-2xl font-bold mt-2",
                                        analysis.totalUnrealizedGain >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {analysis.totalUnrealizedGain >= 0 ? "+" : ""}{formatCurrency(analysis.totalUnrealizedGain)}
                                    </div>
                                    <div className={cn(
                                        "text-xs font-medium",
                                        analysis.totalUnrealizedGain >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {formatPercentage(analysis.totalUnrealizedGainPct)}
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Percent className="h-4 w-4" />
                                        Win Rate
                                    </div>
                                    <div className="text-2xl font-bold mt-2">
                                        {((analysis.profitableStocks.length / holdings.length) * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {analysis.profitableStocks.length} of {holdings.length} profitable
                                    </div>
                                </div>
                            </div>

                            {/* Gain/Loss Distribution */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-green-600 flex items-center gap-2">
                                            <ArrowUpRight className="h-4 w-4" />
                                            Total Profits
                                        </span>
                                        <span className="text-xl font-bold text-green-600">
                                            +{formatCurrency(analysis.totalProfits)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={analysis.totalProfits / (analysis.totalProfits + analysis.totalLosses) * 100}
                                        className="h-3 bg-red-100"
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {analysis.profitableStocks.length} stocks in profit
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-red-600 flex items-center gap-2">
                                            <ArrowDownRight className="h-4 w-4" />
                                            Total Losses
                                        </span>
                                        <span className="text-xl font-bold text-red-600">
                                            -{formatCurrency(analysis.totalLosses)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={analysis.totalLosses / (analysis.totalProfits + analysis.totalLosses) * 100}
                                        className="h-3 bg-green-100"
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {analysis.losingStocks.length} stocks in loss
                                    </div>
                                </div>
                            </div>

                            {/* Sector Breakdown */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sector</TableHead>
                                            <TableHead className="text-right">Cost Basis</TableHead>
                                            <TableHead className="text-right">Market Value</TableHead>
                                            <TableHead className="text-right">Gain/Loss</TableHead>
                                            <TableHead className="text-right">Return</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(analysis.sectorBreakdown)
                                            .sort((a, b) => b[1].marketValue - a[1].marketValue)
                                            .map(([sector, data]) => (
                                                <TableRow key={sector}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{ backgroundColor: sectorColors[sector as Sector] }}
                                                            />
                                                            <span className="font-medium">{sector}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {data.stockCount}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(data.totalCost)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(data.marketValue)}
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "text-right font-medium",
                                                        data.unrealizedGain >= 0 ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        {data.unrealizedGain >= 0 ? "+" : ""}{formatCurrency(data.unrealizedGain)}
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "text-right font-medium",
                                                        data.gainPct >= 0 ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        {formatPercentage(data.gainPct)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Gains Tab */}
                        <TabsContent value="gains" className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Top Gainers */}
                                <div className="rounded-lg border border-green-200 dark:border-green-900">
                                    <div className="p-4 border-b border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
                                        <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Biggest Gainers
                                        </h3>
                                    </div>
                                    <div className="divide-y">
                                        {analysis.stocks
                                            .filter((s) => s.unrealizedGain > 0)
                                            .slice(0, 5)
                                            .map((stock) => (
                                                <div
                                                    key={stock.symbol}
                                                    className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                                                    onClick={() => {
                                                        setSelectedStock(stock.holding);
                                                        setStockModalOpen(true);
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-semibold">{stock.symbol}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Cost: {formatCurrency(stock.totalCost)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-green-600">
                                                        <div className="font-semibold">+{formatCurrency(stock.unrealizedGain)}</div>
                                                        <div className="text-xs">{formatPercentage(stock.unrealizedGainPct)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Top Losers */}
                                <div className="rounded-lg border border-red-200 dark:border-red-900">
                                    <div className="p-4 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                                        <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4" />
                                            Biggest Losers
                                        </h3>
                                    </div>
                                    <div className="divide-y">
                                        {analysis.stocks
                                            .filter((s) => s.unrealizedGain < 0)
                                            .sort((a, b) => a.unrealizedGain - b.unrealizedGain)
                                            .slice(0, 5)
                                            .map((stock) => (
                                                <div
                                                    key={stock.symbol}
                                                    className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                                                    onClick={() => {
                                                        setSelectedStock(stock.holding);
                                                        setStockModalOpen(true);
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-semibold">{stock.symbol}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Cost: {formatCurrency(stock.totalCost)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-red-600">
                                                        <div className="font-semibold">{formatCurrency(stock.unrealizedGain)}</div>
                                                        <div className="text-xs">{formatPercentage(stock.unrealizedGainPct)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tax Tab */}
                        <TabsContent value="tax" className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                        <DollarSign className="h-4 w-4" />
                                        Taxable LTCG
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(analysis.taxableLTCG)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Above ₹1,00,000 exemption
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                        <Calculator className="h-4 w-4" />
                                        Estimated LTCG Tax
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(analysis.estimatedLTCGTax)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        @10% on taxable gains
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/30">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm mb-2">
                                        <PiggyBank className="h-4 w-4" />
                                        Potential Tax Savings
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(analysis.potentialTaxSavings)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Via tax loss harvesting
                                    </div>
                                </div>
                            </div>

                            {/* Tax Loss Harvesting Candidates */}
                            {analysis.losingStocks.length > 0 && (
                                <div className="rounded-lg border">
                                    <div className="p-4 border-b bg-muted/50">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            Tax Loss Harvesting Candidates
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Consider selling these to offset capital gains
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Stock</TableHead>
                                                        <TableHead className="text-right">Loss</TableHead>
                                                        <TableHead className="text-right">Tax Benefit @10%</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {analysis.losingStocks
                                                        .sort((a, b) => a.unrealizedGain - b.unrealizedGain)
                                                        .slice(0, 5)
                                                        .map((stock) => (
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
                                                                </TableCell>
                                                                <TableCell className="text-right text-red-600">
                                                                    {formatCurrency(stock.unrealizedGain)}
                                                                </TableCell>
                                                                <TableCell className="text-right text-green-600">
                                                                    +{formatCurrency(Math.abs(stock.unrealizedGain) * 0.10)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tax Tips */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/30">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-blue-800 dark:text-blue-400">LTCG Tax Tip</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                                                LTCG up to ₹1,00,000 is exempt. Consider booking gains in tranches across financial years.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/30">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Important Note</h4>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                                Tax calculations are estimates. Consult a tax professional for accurate advice.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Details Tab */}
                        <TabsContent value="details">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Sector</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Avg Cost</TableHead>
                                            <TableHead className="text-right">LTP</TableHead>
                                            <TableHead className="text-right">Cost Basis</TableHead>
                                            <TableHead className="text-right">Market Value</TableHead>
                                            <TableHead className="text-right">Gain/Loss</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analysis.stocks.map((stock) => (
                                            <TableRow
                                                key={stock.symbol}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    setSelectedStock(stock.holding);
                                                    setStockModalOpen(true);
                                                }}
                                            >
                                                <TableCell className="font-semibold">{stock.symbol}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" style={{
                                                        borderColor: sectorColors[stock.sector as Sector],
                                                        color: sectorColors[stock.sector as Sector],
                                                    }}>
                                                        {stock.sector}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{stock.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(stock.avgCost)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(stock.currentPrice)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(stock.totalCost)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(stock.marketValue)}</TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-medium",
                                                    stock.unrealizedGain >= 0 ? "text-green-600" : "text-red-600"
                                                )}>
                                                    <div className="flex flex-col items-end">
                                                        <span>{stock.unrealizedGain >= 0 ? "+" : ""}{formatCurrency(stock.unrealizedGain)}</span>
                                                        <span className="text-xs">{formatPercentage(stock.unrealizedGainPct)}</span>
                                                    </div>
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
