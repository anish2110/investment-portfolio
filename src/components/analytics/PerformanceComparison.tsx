"use client";

import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChartContainer } from "@/components/ui/chart";
import type { Holding } from "@/lib/types";
import { getSector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

interface PerformanceComparisonProps {
    holdings: Holding[];
}

type SortMode = "pnl" | "pnlPercentage" | "value" | "alphabetical";

export function PerformanceComparison({ holdings }: PerformanceComparisonProps) {
    const [sortMode, setSortMode] = useState<SortMode>("pnl");
    const [showCount, setShowCount] = useState<string>("20");

    const data = useMemo(() => {
        const processed = holdings.map((h) => {
            const investment = h.quantity * h.average_price;
            const currentValue = h.quantity * h.last_price;
            const pnlPercentage =
                investment > 0 ? ((currentValue - investment) / investment) * 100 : 0;

            return {
                symbol: h.tradingsymbol,
                sector: h.sector || getSector(h.tradingsymbol),
                pnl: h.pnl,
                pnlPercentage,
                investment,
                currentValue,
                quantity: h.quantity,
                avgPrice: h.average_price,
                lastPrice: h.last_price,
            };
        });

        // Sort based on mode
        switch (sortMode) {
            case "pnl":
                processed.sort((a, b) => b.pnl - a.pnl);
                break;
            case "pnlPercentage":
                processed.sort((a, b) => b.pnlPercentage - a.pnlPercentage);
                break;
            case "value":
                processed.sort((a, b) => b.currentValue - a.currentValue);
                break;
            case "alphabetical":
                processed.sort((a, b) => a.symbol.localeCompare(b.symbol));
                break;
        }

        const count = showCount === "all" ? processed.length : parseInt(showCount);
        return processed.slice(0, count);
    }, [holdings, sortMode, showCount]);

    const maxAbsPnl = useMemo(
        () => Math.max(...data.map((d) => Math.abs(d.pnl)), 1),
        [data]
    );

    const maxAbsPnlPercent = useMemo(
        () => Math.max(...data.map((d) => Math.abs(d.pnlPercentage)), 1),
        [data]
    );

    const chartConfig = {
        pnl: { label: "P&L" },
        pnlPercentage: { label: "P&L %" },
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const item = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                        {item.sector}
                    </Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Investment:</span>
                        <span>{formatCurrency(item.investment)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span className="font-medium">{formatCurrency(item.currentValue)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">P&L:</span>
                        <span
                            className={cn(
                                "font-medium",
                                item.pnl >= 0 ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {item.pnl >= 0 ? "+" : ""}
                            {formatCurrency(item.pnl)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Returns:</span>
                        <span
                            className={cn(
                                "font-medium",
                                item.pnlPercentage >= 0 ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {formatPercentage(item.pnlPercentage)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Qty:</span>
                        <span>{item.quantity}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Avg / LTP:</span>
                        <span>
                            {formatCurrency(item.avgPrice)} / {formatCurrency(item.lastPrice)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Stock Performance
                        <Badge variant="secondary">{data.length} stocks</Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pnl">Sort by P&L</SelectItem>
                                <SelectItem value="pnlPercentage">Sort by P&L %</SelectItem>
                                <SelectItem value="value">Sort by Value</SelectItem>
                                <SelectItem value="alphabetical">A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={showCount} onValueChange={setShowCount}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">Top 10</SelectItem>
                                <SelectItem value="20">Top 20</SelectItem>
                                <SelectItem value="50">Top 50</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="w-full"
                    style={{ height: Math.max(300, data.length * 28) }}
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={(v) =>
                                sortMode === "pnlPercentage"
                                    ? `${v.toFixed(0)}%`
                                    : formatCurrency(v)
                            }
                            domain={
                                sortMode === "pnlPercentage"
                                    ? [-maxAbsPnlPercent * 1.1, maxAbsPnlPercent * 1.1]
                                    : [-maxAbsPnl * 1.1, maxAbsPnl * 1.1]
                            }
                        />
                        <YAxis
                            type="category"
                            dataKey="symbol"
                            tick={{ fontSize: 11 }}
                            width={75}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
                        <Bar
                            dataKey={sortMode === "pnlPercentage" ? "pnlPercentage" : "pnl"}
                            radius={[0, 4, 4, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        (sortMode === "pnlPercentage"
                                            ? entry.pnlPercentage
                                            : entry.pnl) >= 0
                                            ? "hsl(142, 71%, 45%)"
                                            : "hsl(0, 84%, 60%)"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
