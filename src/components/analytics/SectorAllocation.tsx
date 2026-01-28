"use client";

import { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Sector,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getSector, sectorColors, getAllMutualFundCategories, type Sector as SectorType } from "@/lib/sectors";
import type { Holding, SectorData } from "@/lib/types";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import type { AssetTypeFilter } from "@/app/page";

interface SectorAllocationProps {
    holdings: Holding[];
    assetTypeFilter?: AssetTypeFilter;
}

export function SectorAllocation({ holdings, assetTypeFilter = "all" }: SectorAllocationProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Determine chart title based on filter
    const chartTitle = useMemo(() => {
        if (assetTypeFilter === "equity") return "Sector Allocation (Stocks)";
        if (assetTypeFilter === "mf") return "Category Allocation (Mutual Funds)";
        return "Sector/Category Allocation";
    }, [assetTypeFilter]);

    const sectorData = useMemo(() => {
        const sectors: Record<string, SectorData> = {};

        holdings.forEach((holding) => {
            const sector = holding.sector || getSector(holding.tradingsymbol);
            const investment = holding.quantity * holding.average_price;
            const currentValue = holding.quantity * holding.last_price;
            const pnl = holding.pnl;

            if (!sectors[sector]) {
                sectors[sector] = {
                    name: sector,
                    value: 0,
                    investment: 0,
                    currentValue: 0,
                    pnl: 0,
                    pnlPercentage: 0,
                    count: 0,
                    color: sectorColors[sector as SectorType],
                    holdings: [],
                };
            }

            sectors[sector].investment += investment;
            sectors[sector].currentValue += currentValue;
            sectors[sector].value = sectors[sector].currentValue;
            sectors[sector].pnl += pnl;
            sectors[sector].count += 1;
            sectors[sector].holdings.push(holding);
        });

        // Calculate percentages
        Object.values(sectors).forEach((sector) => {
            sector.pnlPercentage =
                sector.investment > 0 ? (sector.pnl / sector.investment) * 100 : 0;
        });

        return Object.values(sectors).sort((a, b) => b.value - a.value);
    }, [holdings]);

    const totalValue = useMemo(
        () => sectorData.reduce((sum, s) => sum + s.value, 0),
        [sectorData]
    );

    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {};
        sectorData.forEach((sector) => {
            config[sector.name] = {
                label: sector.name,
                color: sector.color,
            };
        });
        return config;
    }, [sectorData]);

    const renderActiveShape = (props: any) => {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
        } = props;

        return (
            <g>
                <text
                    x={cx}
                    y={cy - 10}
                    dy={0}
                    textAnchor="middle"
                    className="fill-foreground text-sm font-semibold"
                >
                    {payload.name}
                </text>
                <text
                    x={cx}
                    y={cy + 10}
                    dy={8}
                    textAnchor="middle"
                    className="fill-muted-foreground text-xs"
                >
                    {(percent * 100).toFixed(1)}%
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 10}
                    outerRadius={outerRadius + 14}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {chartTitle}
                        <Badge variant="secondary">{sectorData.length} {assetTypeFilter === "mf" ? "categories" : "sectors"}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <PieChart>
                            <Pie
                                data={sectorData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                activeIndex={activeIndex ?? undefined}
                                activeShape={renderActiveShape}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {sectorData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => (
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{name}</span>
                                                <span>{formatCurrency(value as number)}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {((Number(value) / totalValue) * 100).toFixed(1)}% of
                                                    portfolio
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{assetTypeFilter === "mf" ? "Category" : "Sector"} Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sector</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead className="text-right">Weight</TableHead>
                                <TableHead className="text-right">P&L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectorData.map((sector) => (
                                <TableRow key={sector.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: sector.color }}
                                            />
                                            <span className="font-medium">{sector.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {sector.count}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(sector.currentValue)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {((sector.value / totalValue) * 100).toFixed(1)}%
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "text-right font-medium",
                                            sector.pnl >= 0 ? "text-green-600" : "text-red-600"
                                        )}
                                    >
                                        <div className="flex flex-col items-end">
                                            <span>{formatCurrency(sector.pnl)}</span>
                                            <span className="text-xs">
                                                {formatPercentage(sector.pnlPercentage)}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
