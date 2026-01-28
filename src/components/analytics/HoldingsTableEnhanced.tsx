"use client";

import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    X,
    SlidersHorizontal,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Info,
    Target,
    Wallet,
    PieChart,
} from "lucide-react";
import type { Holding, StockPerformance } from "@/lib/types";
import { getSector, getAllSectors, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { StockDetailModal } from "./StockDetailModal";

interface HoldingsTableProps {
    holdings: Holding[];
}

type SortKey =
    | "symbol"
    | "sector"
    | "quantity"
    | "avgPrice"
    | "lastPrice"
    | "investment"
    | "currentValue"
    | "pnl"
    | "pnlPercentage"
    | "portfolioWeight";
type SortDirection = "asc" | "desc";

export function HoldingsTable({ holdings }: HoldingsTableProps) {
    const [search, setSearch] = useState("");
    const [sectorFilter, setSectorFilter] = useState<string>("all");
    const [pnlFilter, setPnlFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sortKey, setSortKey] = useState<SortKey>("currentValue");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedStock, setSelectedStock] = useState<Holding | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);

    const totalValue = useMemo(
        () => holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0),
        [holdings]
    );

    const totalInvestment = useMemo(
        () => holdings.reduce((sum, h) => sum + h.quantity * h.average_price, 0),
        [holdings]
    );

    const processedHoldings = useMemo<(StockPerformance & { holding: Holding })[]>(() => {
        return holdings.map((h) => {
            const investment = h.quantity * h.average_price;
            const currentValue = h.quantity * h.last_price;
            const pnlPercentage =
                investment > 0 ? ((currentValue - investment) / investment) * 100 : 0;

            return {
                symbol: h.tradingsymbol,
                sector: h.sector || getSector(h.tradingsymbol),
                investment,
                currentValue,
                pnl: h.pnl,
                pnlPercentage,
                quantity: h.quantity,
                avgPrice: h.average_price,
                lastPrice: h.last_price,
                portfolioWeight: totalValue > 0 ? (currentValue / totalValue) * 100 : 0,
                holding: h,
            };
        });
    }, [holdings, totalValue]);

    const filteredAndSorted = useMemo(() => {
        let result = [...processedHoldings];

        // Apply search
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (h) =>
                    h.symbol.toLowerCase().includes(searchLower) ||
                    h.sector.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (typeFilter !== "all") {
            result = result.filter((h) => h.holding.type === typeFilter);
        }

        // Apply sector filter
        if (sectorFilter !== "all") {
            result = result.filter((h) => h.sector === sectorFilter);
        }

        // Apply P&L filter
        if (pnlFilter === "profit") {
            result = result.filter((h) => h.pnl > 0);
        } else if (pnlFilter === "loss") {
            result = result.filter((h) => h.pnl < 0);
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDirection === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortDirection === "asc"
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });

        return result;
    }, [processedHoldings, search, sectorFilter, pnlFilter, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    const toggleRow = (symbol: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(symbol)) {
            newExpanded.delete(symbol);
        } else {
            newExpanded.add(symbol);
        }
        setExpandedRows(newExpanded);
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) {
            return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
        );
    };

    const sectors = useMemo(() => {
        const uniqueSectors = new Set(processedHoldings.map((h) => h.sector));
        return Array.from(uniqueSectors).sort();
    }, [processedHoldings]);

    const clearFilters = () => {
        setSearch("");
        setSectorFilter("all");
        setPnlFilter("all");
        setTypeFilter("all");
    };

    const hasFilters = search || sectorFilter !== "all" || pnlFilter !== "all" || typeFilter !== "all";

    // Calculate sector stats for the expanded view
    const getSectorStats = (sector: string) => {
        const sectorHoldings = processedHoldings.filter((h) => h.sector === sector);
        const sectorValue = sectorHoldings.reduce((sum, h) => sum + h.currentValue, 0);
        return {
            count: sectorHoldings.length,
            value: sectorValue,
            weight: totalValue > 0 ? (sectorValue / totalValue) * 100 : 0,
        };
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                Holdings
                                <Badge variant="secondary">
                                    {filteredAndSorted.length} of {holdings.length}
                                </Badge>
                            </CardTitle>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="mr-1 h-3 w-3" />
                                    Clear filters
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search stocks..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={sectorFilter} onValueChange={setSectorFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="All Sectors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sectors</SelectItem>
                                    {sectors.map((sector) => (
                                        <SelectItem key={sector} value={sector}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{
                                                        backgroundColor: sectorColors[sector as Sector],
                                                    }}
                                                />
                                                {sector}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={pnlFilter} onValueChange={setPnlFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All P&L" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All P&L</SelectItem>
                                    <SelectItem value="profit">🟢 Profit Only</SelectItem>
                                    <SelectItem value="loss">🔴 Loss Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="equity">📈 Stocks</SelectItem>
                                    <SelectItem value="mf">📊 Mutual Funds</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("symbol")}
                                    >
                                        <div className="flex items-center">
                                            Symbol
                                            <SortIcon column="symbol" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("sector")}
                                    >
                                        <div className="flex items-center">
                                            Sector
                                            <SortIcon column="sector" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("quantity")}
                                    >
                                        <div className="flex items-center justify-end">
                                            Qty
                                            <SortIcon column="quantity" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("avgPrice")}
                                    >
                                        <div className="flex items-center justify-end">
                                            Avg Price
                                            <SortIcon column="avgPrice" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("lastPrice")}
                                    >
                                        <div className="flex items-center justify-end">
                                            LTP
                                            <SortIcon column="lastPrice" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("currentValue")}
                                    >
                                        <div className="flex items-center justify-end">
                                            Value
                                            <SortIcon column="currentValue" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("pnl")}
                                    >
                                        <div className="flex items-center justify-end">
                                            P&L
                                            <SortIcon column="pnl" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("pnlPercentage")}
                                    >
                                        <div className="flex items-center justify-end">
                                            P&L %
                                            <SortIcon column="pnlPercentage" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-muted/50"
                                        onClick={() => handleSort("portfolioWeight")}
                                    >
                                        <div className="flex items-center justify-end">
                                            Weight
                                            <SortIcon column="portfolioWeight" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            {filteredAndSorted.length === 0 ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No holdings match your filters
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                filteredAndSorted.map((holding) => {
                                    const isExpanded = expandedRows.has(holding.symbol);
                                    const sectorStats = getSectorStats(holding.sector);
                                    const priceChange = holding.lastPrice - holding.avgPrice;
                                    const priceChangePct = (priceChange / holding.avgPrice) * 100;

                                    return (
                                        <Collapsible key={holding.symbol} open={isExpanded} asChild>
                                            <tbody className="data-[state=open]:bg-muted/5">
                                                <TableRow className="group cursor-pointer hover:bg-muted/50">
                                                    <TableCell>
                                                        <CollapsibleTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleRow(holding.symbol);
                                                                }}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </TableCell>
                                                    <TableCell
                                                        className="font-semibold"
                                                        onClick={() => {
                                                            setSelectedStock(holding.holding);
                                                            setStockModalOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {holding.symbol}
                                                            {holding.pnl >= 0 ? (
                                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3 text-red-600" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                            style={{
                                                                borderColor: sectorColors[holding.sector as Sector],
                                                                color: sectorColors[holding.sector as Sector],
                                                            }}
                                                        >
                                                            {holding.sector}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{holding.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(holding.avgPrice)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(holding.lastPrice)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(holding.currentValue)}
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            "text-right font-medium",
                                                            holding.pnl >= 0 ? "text-green-600" : "text-red-600"
                                                        )}
                                                    >
                                                        {holding.pnl >= 0 ? "+" : ""}
                                                        {formatCurrency(holding.pnl)}
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            "text-right font-medium",
                                                            holding.pnlPercentage >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        )}
                                                    >
                                                        {formatPercentage(holding.pnlPercentage)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
                                                                <div
                                                                    className="bg-primary h-full rounded-full"
                                                                    style={{
                                                                        width: `${Math.min(holding.portfolioWeight, 100)}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-muted-foreground text-xs">
                                                                {holding.portfolioWeight.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                <CollapsibleContent asChild>
                                                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-0">
                                                        <TableCell colSpan={10} className="p-0">
                                                            <div className="p-4">
                                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                                    {/* Investment Details */}
                                                                    <div className="rounded-lg border bg-background p-3">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                                            <Wallet className="h-4 w-4" />
                                                                            Investment
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Cost Basis</span>
                                                                                <span className="font-medium">{formatCurrency(holding.investment)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Market Value</span>
                                                                                <span className="font-medium">{formatCurrency(holding.currentValue)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price Analysis */}
                                                                    <div className="rounded-lg border bg-background p-3">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                                            <Target className="h-4 w-4" />
                                                                            Price Analysis
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Price Change</span>
                                                                                <span className={cn(
                                                                                    "font-medium",
                                                                                    priceChange >= 0 ? "text-green-600" : "text-red-600"
                                                                                )}>
                                                                                    {priceChange >= 0 ? "+" : ""}{formatCurrency(priceChange)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Change %</span>
                                                                                <span className={cn(
                                                                                    "font-medium",
                                                                                    priceChangePct >= 0 ? "text-green-600" : "text-red-600"
                                                                                )}>
                                                                                    {formatPercentage(priceChangePct)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Sector Info */}
                                                                    <div className="rounded-lg border bg-background p-3">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                                            <PieChart className="h-4 w-4" />
                                                                            Sector: {holding.sector}
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Stocks in Sector</span>
                                                                                <span className="font-medium">{sectorStats.count}</span>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>Sector Weight</span>
                                                                                <span className="font-medium">{sectorStats.weight.toFixed(1)}%</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick Actions */}
                                                                    <div className="rounded-lg border bg-background p-3">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                                            <Info className="h-4 w-4" />
                                                                            Quick Actions
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full h-7 text-xs"
                                                                                onClick={() => {
                                                                                    setSelectedStock(holding.holding);
                                                                                    setStockModalOpen(true);
                                                                                }}
                                                                            >
                                                                                View Full Analysis
                                                                                <ExternalLink className="h-3 w-3 ml-1" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Performance Summary */}
                                                                <div className="mt-4 pt-4 border-t">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex-1">
                                                                            <div className="text-xs text-muted-foreground mb-1">
                                                                                Position Performance
                                                                            </div>
                                                                            <Progress
                                                                                value={50 + (Math.min(50, Math.max(-50, holding.pnlPercentage)))}
                                                                                className={cn(
                                                                                    "h-2",
                                                                                    holding.pnl >= 0 ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
                                                                                )}
                                                                            />
                                                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                                <span>-50%</span>
                                                                                <span>0%</span>
                                                                                <span>+50%</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </CollapsibleContent>
                                            </tbody>
                                        </Collapsible>
                                    );
                                })
                            )}
                        </Table>
                    </div>
                    <p className="text-center text-muted-foreground text-xs mt-3">
                        Click on expand icon to see details, or click on stock name for full analysis
                    </p>
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
