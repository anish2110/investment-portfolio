"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { getSector } from "@/lib/sectors";
import { StockDetailModal } from "./StockDetailModal";

interface TopMoversProps {
    holdings: Holding[];
}

export function TopMovers({ holdings }: TopMoversProps) {
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);

    const { gainers, losers } = useMemo(() => {
        const withPercentage = holdings.map((h) => ({
            ...h,
            pnlPercentage:
                h.average_price > 0
                    ? ((h.last_price - h.average_price) / h.average_price) * 100
                    : 0,
            sector: h.sector || getSector(h.tradingsymbol),
        }));

        const sorted = [...withPercentage].sort(
            (a, b) => b.pnlPercentage - a.pnlPercentage
        );

        return {
            gainers: sorted.filter((h) => h.pnlPercentage > 0).slice(0, 5),
            losers: sorted.filter((h) => h.pnlPercentage < 0).slice(-5).reverse(),
        };
    }, [holdings]);

    const handleStockClick = (holding: Holding) => {
        setSelectedStock(holding);
        setStockModalOpen(true);
    };

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Gainers */}
                <Card className="border-green-200 dark:border-green-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-5 w-5" />
                            Top Gainers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {gainers.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No gainers yet</p>
                        ) : (
                            gainers.map((holding, index) => (
                                <div
                                    key={holding.tradingsymbol}
                                    className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 p-3 dark:border-green-900/50 dark:bg-green-950/20 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
                                    onClick={() => handleStockClick(holding)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-green-700 dark:text-green-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {holding.tradingsymbol}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {holding.sector}
                                                </Badge>
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {holding.quantity} shares @ {formatCurrency(holding.average_price)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-green-600">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span className="font-semibold">
                                                {formatPercentage(holding.pnlPercentage)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-green-600">
                                            +{formatCurrency(holding.pnl)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Top Losers */}
                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <TrendingDown className="h-5 w-5" />
                            Top Losers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {losers.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No losers yet</p>
                        ) : (
                            losers.map((holding, index) => (
                                <div
                                    key={holding.tradingsymbol}
                                    className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-950/20 cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                                    onClick={() => handleStockClick(holding)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-red-700 dark:text-red-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {holding.tradingsymbol}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {holding.sector}
                                                </Badge>
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {holding.quantity} shares @ {formatCurrency(holding.average_price)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-red-600">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span className="font-semibold">
                                                {formatPercentage(holding.pnlPercentage)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-red-600">
                                            {formatCurrency(holding.pnl)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <StockDetailModal
                holding={selectedStock}
                open={stockModalOpen}
                onOpenChange={setStockModalOpen}
                allHoldings={holdings}
            />
        </>
    );
}
