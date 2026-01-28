"use client";

import { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Sector,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getSector, sectorColors, type Sector as SectorType } from "@/lib/sectors";
import type { Holding, SectorData } from "@/lib/types";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import {
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Building2,
    X,
} from "lucide-react";
import { StockDetailModal } from "./StockDetailModal";
import type { AssetTypeFilter } from "@/app/page";

interface SectorAllocationProps {
    holdings: Holding[];
    assetTypeFilter?: AssetTypeFilter;
}

export function SectorAllocation({ holdings, assetTypeFilter = "all" }: SectorAllocationProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);

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

        // Calculate percentages and sort holdings within each sector
        Object.values(sectors).forEach((sector) => {
            sector.pnlPercentage =
                sector.investment > 0 ? (sector.pnl / sector.investment) * 100 : 0;
            // Sort holdings by value descending
            sector.holdings.sort((a, b) =>
                (b.quantity * b.last_price) - (a.quantity * a.last_price)
            );
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

    const handleSectorClick = (sector: SectorData) => {
        setSelectedSector(sector);
    };

    const handleStockClick = (holding: Holding) => {
        setSelectedStock(holding);
        setStockModalOpen(true);
    };

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
        <>
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
                                    onClick={(data) => handleSectorClick(data)}
                                    className="cursor-pointer"
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
                                                    <span className="text-primary text-xs mt-1">
                                                        Click to see stocks →
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                            </PieChart>
                        </ChartContainer>
                        <p className="text-center text-muted-foreground text-xs mt-2">
                            Click on any sector to view stocks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sector Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sector</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                    <TableHead className="text-right">Weight</TableHead>
                                    <TableHead className="text-right">P&L</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sectorData.map((sector) => (
                                    <TableRow
                                        key={sector.name}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSectorClick(sector)}
                                    >
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
                                        <TableCell>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Sector Detail Dialog */}
            <Dialog open={!!selectedSector} onOpenChange={(open) => !open && setSelectedSector(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: selectedSector?.color }}
                            />
                            <span>{selectedSector?.name}</span>
                            <Badge variant="secondary">{selectedSector?.count} stocks</Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSector && (
                        <div className="space-y-4">
                            {/* Sector Summary */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg border bg-muted/50 p-3">
                                    <div className="text-muted-foreground text-xs">Investment</div>
                                    <div className="font-semibold">{formatCurrency(selectedSector.investment)}</div>
                                </div>
                                <div className="rounded-lg border bg-muted/50 p-3">
                                    <div className="text-muted-foreground text-xs">Current Value</div>
                                    <div className="font-semibold">{formatCurrency(selectedSector.currentValue)}</div>
                                </div>
                                <div className="rounded-lg border bg-muted/50 p-3">
                                    <div className="text-muted-foreground text-xs">Portfolio Weight</div>
                                    <div className="font-semibold">
                                        {((selectedSector.value / totalValue) * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div className={cn(
                                    "rounded-lg border p-3",
                                    selectedSector.pnl >= 0
                                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
                                        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                                )}>
                                    <div className="text-muted-foreground text-xs">P&L</div>
                                    <div className={cn(
                                        "font-semibold flex items-center gap-1",
                                        selectedSector.pnl >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {selectedSector.pnl >= 0 ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                        {formatCurrency(selectedSector.pnl)}
                                        <span className="text-xs">({formatPercentage(selectedSector.pnlPercentage)})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stocks List */}
                            <ScrollArea className="h-[400px] rounded-md border">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background">
                                        <TableRow>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Avg Price</TableHead>
                                            <TableHead className="text-right">LTP</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead className="text-right">P&L</TableHead>
                                            <TableHead className="text-right">Weight</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSector.holdings.map((holding) => {
                                            const investment = holding.quantity * holding.average_price;
                                            const currentValue = holding.quantity * holding.last_price;
                                            const pnlPercentage = investment > 0
                                                ? (holding.pnl / investment) * 100
                                                : 0;
                                            const weightInSector = selectedSector.currentValue > 0
                                                ? (currentValue / selectedSector.currentValue) * 100
                                                : 0;

                                            return (
                                                <TableRow
                                                    key={holding.tradingsymbol}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleStockClick(holding)}
                                                >
                                                    <TableCell className="font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            {holding.tradingsymbol}
                                                            {holding.pnl >= 0 ? (
                                                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                                                            ) : (
                                                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{holding.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(holding.average_price)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(holding.last_price)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(currentValue)}
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "text-right font-medium",
                                                        holding.pnl >= 0 ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        <div className="flex flex-col items-end">
                                                            <span>
                                                                {holding.pnl >= 0 ? "+" : ""}{formatCurrency(holding.pnl)}
                                                            </span>
                                                            <span className="text-xs">
                                                                {formatPercentage(pnlPercentage)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${weightInSector}%`,
                                                                        backgroundColor: selectedSector.color,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-muted-foreground text-xs w-12">
                                                                {weightInSector.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>

                            <p className="text-center text-muted-foreground text-xs">
                                Click on any stock to view detailed analysis
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Detail Modal */}
            <StockDetailModal
                holding={selectedStock}
                open={stockModalOpen}
                onOpenChange={setStockModalOpen}
                allHoldings={holdings}
            />
        </>
    );
}
