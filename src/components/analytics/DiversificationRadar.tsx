"use client";

import { useMemo, useState } from "react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import type { Holding } from "@/lib/types";
import { getSector, getAllSectors, sectorColors, type Sector } from "@/lib/sectors";
import { formatCurrency } from "@/lib/utils";

interface DiversificationRadarProps {
    holdings: Holding[];
}

export function DiversificationRadar({ holdings }: DiversificationRadarProps) {
    const data = useMemo(() => {
        const totalValue = holdings.reduce(
            (sum, h) => sum + h.quantity * h.last_price,
            0
        );

        // Calculate allocation per sector
        const sectorAllocations: Record<string, number> = {};
        holdings.forEach((h) => {
            const sector = h.sector || getSector(h.tradingsymbol);
            const value = h.quantity * h.last_price;
            sectorAllocations[sector] = (sectorAllocations[sector] || 0) + value;
        });

        // Get sectors that have allocations
        const activeSectors = Object.keys(sectorAllocations);

        // Calculate ideal allocation (equal weight)
        const idealAllocation = totalValue > 0 ? 100 / activeSectors.length : 0;

        return activeSectors.map((sector) => ({
            sector,
            allocation: totalValue > 0
                ? (sectorAllocations[sector] / totalValue) * 100
                : 0,
            ideal: idealAllocation,
            value: sectorAllocations[sector],
            color: sectorColors[sector as Sector],
        }));
    }, [holdings]);

    const chartConfig = {
        allocation: {
            label: "Current Allocation",
            color: "hsl(262, 83%, 58%)",
        },
        ideal: {
            label: "Ideal (Equal Weight)",
            color: "hsl(142, 71%, 45%)",
        },
    };

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
                    <span className="font-semibold">{item.sector}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-medium">{item.allocation.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Ideal:</span>
                        <span>{item.ideal.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Value:</span>
                        <span>{formatCurrency(item.value)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Deviation:</span>
                        <span
                            className={
                                Math.abs(item.allocation - item.ideal) > 10
                                    ? "text-red-600"
                                    : "text-green-600"
                            }
                        >
                            {item.allocation > item.ideal ? "+" : ""}
                            {(item.allocation - item.ideal).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Calculate diversification metrics
    const metrics = useMemo(() => {
        if (data.length === 0) return { score: 0, overweight: [], underweight: [] };

        const avgDeviation =
            data.reduce((sum, d) => sum + Math.abs(d.allocation - d.ideal), 0) /
            data.length;

        const score = Math.max(0, 100 - avgDeviation * 2);

        const overweight = data
            .filter((d) => d.allocation - d.ideal > 5)
            .sort((a, b) => (b.allocation - b.ideal) - (a.allocation - a.ideal))
            .slice(0, 3);

        const underweight = data
            .filter((d) => d.ideal - d.allocation > 5)
            .sort((a, b) => (b.ideal - b.allocation) - (a.ideal - a.allocation))
            .slice(0, 3);

        return { score, overweight, underweight };
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Diversification Analysis
                        <Badge
                            variant={
                                metrics.score >= 70
                                    ? "default"
                                    : metrics.score >= 40
                                        ? "secondary"
                                        : "destructive"
                            }
                        >
                            Score: {metrics.score.toFixed(0)}
                        </Badge>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                            <PolarGrid />
                            <PolarAngleAxis
                                dataKey="sector"
                                tick={{ fontSize: 10 }}
                                className="fill-muted-foreground"
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, "auto"]}
                                tick={{ fontSize: 9 }}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Radar
                                name="Current"
                                dataKey="allocation"
                                stroke="hsl(262, 83%, 58%)"
                                fill="hsl(262, 83%, 58%)"
                                fillOpacity={0.5}
                            />
                            <Radar
                                name="Ideal"
                                dataKey="ideal"
                                stroke="hsl(142, 71%, 45%)"
                                fill="hsl(142, 71%, 45%)"
                                fillOpacity={0.2}
                                strokeDasharray="5 5"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </RadarChart>
                    </ChartContainer>

                    <div className="space-y-6">
                        {/* Overweight sectors */}
                        {metrics.overweight.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-red-600">
                                    ⚠️ Overweight Sectors
                                </h4>
                                <div className="space-y-2">
                                    {metrics.overweight.map((sector) => (
                                        <div
                                            key={sector.sector}
                                            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/30"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: sector.color }}
                                                />
                                                <span className="text-sm font-medium">{sector.sector}</span>
                                            </div>
                                            <div className="text-right text-sm">
                                                <span className="font-semibold text-red-600">
                                                    {sector.allocation.toFixed(1)}%
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    (ideal: {sector.ideal.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Underweight sectors */}
                        {metrics.underweight.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-yellow-600">
                                    📉 Underweight Sectors
                                </h4>
                                <div className="space-y-2">
                                    {metrics.underweight.map((sector) => (
                                        <div
                                            key={sector.sector}
                                            className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-900 dark:bg-yellow-950/30"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: sector.color }}
                                                />
                                                <span className="text-sm font-medium">{sector.sector}</span>
                                            </div>
                                            <div className="text-right text-sm">
                                                <span className="font-semibold text-yellow-600">
                                                    {sector.allocation.toFixed(1)}%
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    (ideal: {sector.ideal.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legend explanation */}
                        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                            <p className="text-muted-foreground">
                                <strong>Diversification Score:</strong> Measures how evenly your
                                portfolio is spread across sectors. A score of 100 means perfect
                                equal-weight allocation. Lower scores indicate concentration risk.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
