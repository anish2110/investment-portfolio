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
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    X,
    SlidersHorizontal,
} from "lucide-react";
import type { Holding, StockPerformance } from "@/lib/types";
import { getSector, getAllSectors, sectorColors, type Sector } from "@/lib/sectors";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

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
    const [sortKey, setSortKey] = useState<SortKey>("currentValue");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const totalValue = useMemo(
        () => holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0),
        [holdings]
    );

    const processedHoldings = useMemo<StockPerformance[]>(() => {
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
    };

    const hasFilters = search || sectorFilter !== "all" || pnlFilter !== "all";

    return (
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
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                        <TableBody>
                            {filteredAndSorted.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        <div className="text-muted-foreground">
                                            No holdings match your filters
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSorted.map((holding) => (
                                    <TableRow key={holding.symbol} className="group">
                                        <TableCell className="font-semibold">
                                            {holding.symbol}
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
