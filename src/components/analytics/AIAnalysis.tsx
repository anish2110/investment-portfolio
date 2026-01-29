"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Sparkles,
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Lightbulb,
    Loader2,
    RefreshCw,
    Newspaper,
    BarChart3,
    Target,
    Download,
    FileText,
    Briefcase,
    ChevronRight,
    Search,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { AnalysisHistory } from "./AnalysisHistory";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIAnalysisProps {
    holdings: Holding[];
}

interface IndividualAnalysis {
    symbol: string;
    analysis: string;
    timestamp: Date;
}

export function AIAnalysis({ holdings }: AIAnalysisProps) {
    const [loading, setLoading] = useState(false);
    const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [individualAnalyses, setIndividualAnalyses] = useState<Record<string, IndividualAnalysis>>({});
    const [saving, setSaving] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"portfolio" | "individual">("portfolio");

    // Sort holdings by value for the dropdown
    const sortedHoldings = [...holdings].sort((a, b) =>
        (b.quantity * b.last_price) - (a.quantity * a.last_price)
    );

    const saveAnalysis = async (content: string, type: 'portfolio' | 'individual', symbol?: string) => {
        try {
            setSaving(true);

            const response = await fetch("/api/ai/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    type,
                    symbol
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save analysis");
            }

            return true;
        } catch (err) {
            console.error("Error saving analysis:", err);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const downloadAnalysis = (content: string, type: 'portfolio' | 'individual', symbol?: string) => {
        if (!content) return;

        const element = document.createElement("a");
        const file = new Blob([content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        const filename = type === 'individual' && symbol
            ? `analysis-${symbol}-${new Date().getTime()}.md`
            : `portfolio-analysis-${new Date().getTime()}.md`;
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const runPortfolioAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            setAnalysis(null);

            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    holdings,
                    analysisType: 'portfolio'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get AI analysis");
            }

            const data = await response.json();

            if (data.analysis) {
                setAnalysis(data.analysis);
                await saveAnalysis(data.analysis, 'portfolio');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const runIndividualAnalysis = async (symbol: string) => {
        if (!symbol) return;

        try {
            setLoadingSymbol(symbol);
            setError(null);

            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    holdings,
                    analysisType: 'individual',
                    symbol
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get AI analysis");
            }

            const data = await response.json();

            if (data.analysis) {
                const newAnalysis: IndividualAnalysis = {
                    symbol,
                    analysis: data.analysis,
                    timestamp: new Date()
                };
                setIndividualAnalyses(prev => ({
                    ...prev,
                    [symbol]: newAnalysis
                }));
                await saveAnalysis(data.analysis, 'individual', symbol);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoadingSymbol(null);
        }
    };

    const getHoldingStats = (holding: Holding) => {
        const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.last_price, 0);
        const value = holding.quantity * holding.last_price;
        const weight = ((value / totalValue) * 100).toFixed(2);
        const pnlPct = (((holding.last_price - holding.average_price) / holding.average_price) * 100).toFixed(2);
        return { weight, pnlPct };
    };

    const MarkdownRenderer = ({ content }: { content: string }) => (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: (props) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props} />,
                h2: (props) => <h2 className="text-xl font-semibold mb-3 mt-5 px-2 py-1 bg-muted/50 rounded-md border-l-4 border-purple-500" {...props} />,
                h3: (props) => <h3 className="text-lg font-medium mb-2 mt-4 text-purple-600 dark:text-purple-400" {...props} />,
                h4: (props) => <h4 className="text-base font-medium mb-2 mt-3 text-pink-600 dark:text-pink-400" {...props} />,
                p: (props) => <p className="mb-3 text-muted-foreground leading-relaxed" {...props} />,
                ul: (props) => <ul className="list-disc pl-5 mb-4 space-y-1 text-muted-foreground" {...props} />,
                ol: (props) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-muted-foreground" {...props} />,
                li: (props) => <li className="pl-1" {...props} />,
                strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
                blockquote: (props) => <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground my-4" {...props} />,
                table: (props) => <div className="overflow-x-auto my-4 rounded-lg border"><table className="w-full text-sm" {...props} /></div>,
                thead: (props) => <thead className="bg-muted text-muted-foreground font-medium" {...props} />,
                tbody: (props) => <tbody className="divide-y" {...props} />,
                tr: (props) => <tr className="hover:bg-muted/50 transition-colors" {...props} />,
                th: (props) => <th className="p-3 text-left font-medium" {...props} />,
                td: (props) => <td className="p-3 align-top" {...props} />,
                code: (props) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    );

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                AI Portfolio Analysis
                                <Badge variant="outline" className="ml-2 text-xs">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    Powered by Gemini
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Deep analysis of market conditions and personalized recommendations
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <AnalysisHistory />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "portfolio" | "individual")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="portfolio" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Portfolio Analysis
                        </TabsTrigger>
                        <TabsTrigger value="individual" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Individual Holdings
                        </TabsTrigger>
                    </TabsList>

                    {/* Portfolio Analysis Tab */}
                    <TabsContent value="portfolio" className="mt-0">
                        <div className="flex justify-end mb-4">
                            <Button
                                onClick={runPortfolioAnalysis}
                                disabled={loading || saving}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Portfolio...
                                    </>
                                ) : analysis ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Re-analyze Portfolio
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Run Portfolio Analysis
                                    </>
                                )}
                            </Button>
                        </div>

                        {!analysis && !loading && !error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Portfolio Analysis</h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Get a comprehensive analysis of your entire portfolio including market conditions,
                                    sector allocation, risk assessment, and actionable recommendations.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Badge variant="secondary">
                                        <BarChart3 className="mr-1 h-3 w-3" />
                                        Market Analysis
                                    </Badge>
                                    <Badge variant="secondary">
                                        <Newspaper className="mr-1 h-3 w-3" />
                                        News Integration
                                    </Badge>
                                    <Badge variant="secondary">
                                        <Target className="mr-1 h-3 w-3" />
                                        Recommendations
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-50 animate-pulse" />
                                    <div className="relative rounded-full bg-background p-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                    </div>
                                </div>
                                <p className="mt-4 text-muted-foreground animate-pulse">
                                    Analyzing market conditions and your portfolio...
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This may take a minute for comprehensive analysis
                                </p>
                            </div>
                        )}

                        {error && activeTab === "portfolio" && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-red-500/10 p-4 mb-4">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-red-500">Analysis Failed</h3>
                                <p className="text-muted-foreground max-w-md mb-4">{error}</p>
                                <Button variant="outline" onClick={runPortfolioAnalysis}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {analysis && (
                            <div className="flex flex-col h-[600px]">
                                <div className="flex justify-end mb-3 pb-3 border-b">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadAnalysis(analysis, 'portfolio')}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                                <ScrollArea className="flex-1 pr-4">
                                    <div className="markdown-prose">
                                        <MarkdownRenderer content={analysis} />
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </TabsContent>

                    {/* Individual Holdings Analysis Tab */}
                    <TabsContent value="individual" className="mt-0">
                        <div className="space-y-6">
                            {/* Holding Selector */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex-1 w-full sm:max-w-md">
                                    <label className="text-sm font-medium mb-2 block">Select Holding to Analyze</label>
                                    <Select value={selectedHolding} onValueChange={setSelectedHolding}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose a holding..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedHoldings.map((holding) => {
                                                const stats = getHoldingStats(holding);
                                                const hasAnalysis = !!individualAnalyses[holding.tradingsymbol];
                                                return (
                                                    <SelectItem
                                                        key={holding.tradingsymbol}
                                                        value={holding.tradingsymbol}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{holding.tradingsymbol}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {stats.weight}%
                                                            </Badge>
                                                            <Badge
                                                                variant={Number(stats.pnlPct) >= 0 ? "success" : "destructive"}
                                                                className="text-xs"
                                                            >
                                                                {Number(stats.pnlPct) >= 0 ? "+" : ""}{stats.pnlPct}%
                                                            </Badge>
                                                            {hasAnalysis && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    ✓ Analyzed
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={() => runIndividualAnalysis(selectedHolding)}
                                    disabled={!selectedHolding || loadingSymbol === selectedHolding || saving}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                >
                                    {loadingSymbol === selectedHolding ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing {selectedHolding}...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Analyze Holding
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Quick Analysis Grid - All Holdings */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    All Holdings ({holdings.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {sortedHoldings.map((holding) => {
                                        const stats = getHoldingStats(holding);
                                        const hasAnalysis = !!individualAnalyses[holding.tradingsymbol];
                                        const isLoading = loadingSymbol === holding.tradingsymbol;

                                        return (
                                            <div
                                                key={holding.tradingsymbol}
                                                className={`p-3 rounded-lg border transition-all ${hasAnalysis
                                                    ? 'bg-green-500/5 border-green-500/30'
                                                    : 'bg-muted/20 hover:bg-muted/40'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{holding.tradingsymbol}</span>
                                                        {holding.type === 'mf' && (
                                                            <Badge variant="outline" className="text-xs">MF</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {stats.weight}%
                                                        </Badge>
                                                        <Badge
                                                            variant={Number(stats.pnlPct) >= 0 ? "success" : "destructive"}
                                                            className="text-xs"
                                                        >
                                                            {Number(stats.pnlPct) >= 0 ? "+" : ""}{stats.pnlPct}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        {holding.sector || 'Unknown Sector'}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant={hasAnalysis ? "secondary" : "outline"}
                                                        onClick={() => {
                                                            setSelectedHolding(holding.tradingsymbol);
                                                            if (!hasAnalysis) {
                                                                runIndividualAnalysis(holding.tradingsymbol);
                                                            }
                                                        }}
                                                        disabled={isLoading}
                                                        className="h-7 text-xs"
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : hasAnalysis ? (
                                                            <>View<ChevronRight className="ml-1 h-3 w-3" /></>
                                                        ) : (
                                                            <>Analyze<ChevronRight className="ml-1 h-3 w-3" /></>
                                                        )}
                                                    </Button>
                                                </div>
                                                {hasAnalysis && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                                        ✓ Analyzed {new Date(individualAnalyses[holding.tradingsymbol].timestamp).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Individual Analysis Display */}
                            {error && activeTab === "individual" && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="rounded-full bg-red-500/10 p-4 mb-4">
                                        <AlertTriangle className="h-8 w-8 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-red-500">Analysis Failed</h3>
                                    <p className="text-muted-foreground max-w-md mb-4">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => selectedHolding && runIndividualAnalysis(selectedHolding)}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {loadingSymbol && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg opacity-50 animate-pulse" />
                                        <div className="relative rounded-full bg-background p-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-muted-foreground animate-pulse">
                                        Deep diving into <span className="font-semibold">{loadingSymbol}</span>...
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Researching fundamentals, technicals, news, and more
                                    </p>
                                </div>
                            )}

                            {selectedHolding && individualAnalyses[selectedHolding] && !loadingSymbol && (
                                <div className="flex flex-col h-[500px]">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-500">
                                                {selectedHolding}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Analyzed at {new Date(individualAnalyses[selectedHolding].timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => runIndividualAnalysis(selectedHolding)}
                                                className="gap-2"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Re-analyze
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadAnalysis(
                                                    individualAnalyses[selectedHolding].analysis,
                                                    'individual',
                                                    selectedHolding
                                                )}
                                                className="gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                    <ScrollArea className="flex-1 pr-4">
                                        <div className="markdown-prose">
                                            <MarkdownRenderer content={individualAnalyses[selectedHolding].analysis} />
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {!selectedHolding && !loadingSymbol && Object.keys(individualAnalyses).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Individual Holding Analysis</h3>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        Select a holding from the dropdown above or click &quot;Analyze&quot; on any holding
                                        to get a detailed deep-dive analysis including fundamentals, technicals,
                                        news, institutional activity, and specific recommendations.
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <Badge variant="secondary">
                                            <TrendingUp className="mr-1 h-3 w-3" />
                                            Technical Analysis
                                        </Badge>
                                        <Badge variant="secondary">
                                            <BarChart3 className="mr-1 h-3 w-3" />
                                            Fundamentals
                                        </Badge>
                                        <Badge variant="secondary">
                                            <Newspaper className="mr-1 h-3 w-3" />
                                            Recent News
                                        </Badge>
                                        <Badge variant="secondary">
                                            <Target className="mr-1 h-3 w-3" />
                                            Price Targets
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
