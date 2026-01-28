"use client";

import { useMemo, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
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
import { getSector, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

interface HoldingsHeatmapProps {
    holdings: Holding[];
}

type ViewMode = "value" | "pnl" | "pnlPercentage";

export function HoldingsHeatmap({ holdings }: HoldingsHeatmapProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("value");

    const data = useMemo(() => {
        // Group by sector first
        const sectorGroups: Record<
            string,
            {
                name: string;
                children: Array<{
                    name: string;
                    size: number;
                    value: number;
                    pnl: number;
                    pnlPercentage: number;
                    color: string;
                    holding: Holding;
                }>;
            }
        > = {};

        holdings.forEach((holding) => {
            const sector = holding.sector || getSector(holding.tradingsymbol);
            const investment = holding.quantity * holding.average_price;
            const currentValue = holding.quantity * holding.last_price;
            const pnlPercentage =
                investment > 0 ? ((currentValue - investment) / investment) * 100 : 0;

            if (!sectorGroups[sector]) {
                sectorGroups[sector] = {
                    name: sector,
                    children: [],
                };
            }

            let sizeValue: number;
            let color: string;

            switch (viewMode) {
                case "pnl":
                    sizeValue = Math.abs(holding.pnl);
                    color =
                        holding.pnl >= 0
                            ? `hsl(142, ${Math.min(70, 40 + Math.abs(pnlPercentage))}%, ${Math.max(30, 50 - Math.abs(pnlPercentage) / 2)}%)`
                            : `hsl(0, ${Math.min(70, 40 + Math.abs(pnlPercentage))}%, ${Math.max(30, 50 - Math.abs(pnlPercentage) / 2)}%)`;
                    break;
                case "pnlPercentage":
                    sizeValue = currentValue; // Keep size by value, but color by percentage
                    color =
                        pnlPercentage >= 0
                            ? `hsl(142, ${Math.min(80, 40 + Math.abs(pnlPercentage))}%, ${Math.max(25, 45 - Math.abs(pnlPercentage) / 3)}%)`
                            : `hsl(0, ${Math.min(80, 40 + Math.abs(pnlPercentage))}%, ${Math.max(25, 45 - Math.abs(pnlPercentage) / 3)}%)`;
                    break;
                default:
                    sizeValue = currentValue;
                    color = sectorColors[sector as Sector];
            }

            sectorGroups[sector].children.push({
                name: holding.tradingsymbol,
                size: sizeValue,
                value: currentValue,
                pnl: holding.pnl,
                pnlPercentage,
                color,
                holding,
            });
        });

        return Object.values(sectorGroups).filter((g) => g.children.length > 0);
    }, [holdings, viewMode]);

    const flatData = useMemo(() => {
        return data.flatMap((sector) =>
            sector.children.map((child) => ({
                ...child,
                sector: sector.name,
            }))
        );
    }, [data]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const item = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold">{item.name}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Sector:</span>
                        <span>{item.sector}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
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
                </div>
            </div>
        );
    };

    const CustomTreemapContent = (props: any) => {
        const { x, y, width, height, name, color, pnlPercentage } = props;

        if (width < 30 || height < 20) return null;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    rx={4}
                />
                {width > 50 && height > 35 && pnlPercentage !== undefined && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 6}
                            textAnchor="middle"
                            className="fill-white text-xs font-semibold"
                            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            className="fill-white/90 text-[10px]"
                            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                        >
                            {pnlPercentage >= 0 ? "+" : ""}
                            {pnlPercentage.toFixed(1)}%
                        </text>
                    </>
                )}
            </g>
        );
    };

    const chartConfig = {
        value: { label: "Portfolio Value" },
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Portfolio Heatmap
                        <Badge variant="secondary">{holdings.length} stocks</Badge>
                    </CardTitle>
                    <Select
                        value={viewMode}
                        onValueChange={(v) => setViewMode(v as ViewMode)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="value">By Sector</SelectItem>
                            <SelectItem value="pnl">By P&L Amount</SelectItem>
                            <SelectItem value="pnlPercentage">By P&L %</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <Treemap
                        data={flatData}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="hsl(var(--background))"
                        content={<CustomTreemapContent />}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ChartContainer>
                <div className="mt-4 flex flex-wrap gap-2">
                    {viewMode === "value" &&
                        data.map((sector) => (
                            <Badge
                                key={sector.name}
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            sectorColors[sector.name as Sector] || "gray",
                                    }}
                                />
                                {sector.name} ({sector.children.length})
                            </Badge>
                        ))}
                    {viewMode !== "value" && (
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-8 rounded bg-gradient-to-r from-red-600 to-red-400" />
                                <span className="text-muted-foreground">Loss</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-8 rounded bg-gradient-to-r from-green-400 to-green-600" />
                                <span className="text-muted-foreground">Profit</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
