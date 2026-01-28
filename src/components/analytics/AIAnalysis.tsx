"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import type { Holding } from "@/lib/types";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIAnalysisProps {
    holdings: Holding[];
}

export function AIAnalysis({ holdings }: AIAnalysisProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const runAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            setAnalysis(null);

            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ holdings }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get AI analysis");
            }

            const data = await response.json();

            if (data.analysis) {
                setAnalysis(data.analysis);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

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
                    <Button
                        onClick={runAnalysis}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : analysis ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Re-analyze
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Run Deep Analysis
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {!analysis && !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Brain className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Click the button above to run a comprehensive AI analysis of your portfolio
                            based on current market conditions, recent news, and your holdings.
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
                            This may take a few seconds
                        </p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-red-500/10 p-4 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-red-500">Analysis Failed</h3>
                        <p className="text-muted-foreground max-w-md mb-4">{error}</p>
                        <Button variant="outline" onClick={runAnalysis}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                )}

                {analysis && (
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="markdown-prose">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: (props) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props} />,
                                    h2: (props) => <h2 className="text-xl font-semibold mb-3 mt-5 px-2 py-1 bg-muted/50 rounded-md border-l-4 border-purple-500" {...props} />,
                                    h3: (props) => <h3 className="text-lg font-medium mb-2 mt-4 text-purple-600 dark:text-purple-400" {...props} />,
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
                                {analysis}
                            </ReactMarkdown>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
