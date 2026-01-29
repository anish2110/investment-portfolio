"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    History,
    Loader2,
    Trash2,
    ChevronDown,
    Eye,
    Download,
    FileText,
    FileDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadElementAsPDF } from "@/lib/pdf-utils";

interface AnalysisItem {
    id: string;
    filename: string;
    symbol?: string | null;
    timestamp: number;
    date: string;
    displayDate: string;
}

export function AnalysisHistory() {
    const [histories, setHistories] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(
        null
    );
    const [selectedContent, setSelectedContent] = useState<string | null>(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadHistories();
        }
    }, [isOpen]);

    const loadHistories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/ai/history");
            const data = await response.json();
            setHistories(data.analyses || []);
        } catch (error) {
            console.error("Failed to load analysis history:", error);
        } finally {
            setLoading(false);
        }
    };

    const viewAnalysis = async (item: AnalysisItem) => {
        try {
            setContentLoading(true);
            setSelectedAnalysis(item);
            const response = await fetch(`/api/ai/history/${item.id}`);
            const data = await response.json();
            setSelectedContent(data.content);
        } catch (error) {
            console.error("Failed to load analysis content:", error);
        } finally {
            setContentLoading(false);
        }
    };

    const deleteAnalysis = async (item: AnalysisItem) => {
        if (!confirm(`Delete analysis from ${item.displayDate}?`)) return;

        try {
            const response = await fetch(`/api/ai/history/${item.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setHistories(histories.filter((h) => h.id !== item.id));
                if (selectedAnalysis?.id === item.id) {
                    setSelectedAnalysis(null);
                    setSelectedContent(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete analysis:", error);
        }
    };

    const downloadAnalysisAsMarkdown = (item: AnalysisItem) => {
        if (!selectedContent) return;

        const element = document.createElement("a");
        const file = new Blob([selectedContent], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = item.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadAnalysisAsPDF = async (item: AnalysisItem) => {
        if (!contentRef.current) return;

        try {
            setDownloadingPDF(true);
            const pdfFilename = item.filename.replace(".md", ".pdf");
            await downloadElementAsPDF(contentRef.current, pdfFilename);
        } catch (error) {
            console.error("Failed to download PDF:", error);
        } finally {
            setDownloadingPDF(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Analysis History
                    </DialogTitle>
                    <DialogDescription>
                        View and manage your previous portfolio analyses
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
                    {/* History List */}
                    <div className="w-72 border-r flex-shrink-0">
                        <ScrollArea className="h-full">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : histories.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No analyses saved yet
                                </div>
                            ) : (
                                <div className="space-y-2 p-4">
                                    {histories.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`group rounded-lg border p-3 cursor-pointer transition-colors ${selectedAnalysis?.id === item.id
                                                ? "bg-muted border-purple-500"
                                                : "hover:bg-muted/50"
                                                }`}
                                        >
                                            <div
                                                onClick={() => viewAnalysis(item)}
                                                className="flex-1"
                                            >
                                                <div className="font-sm font-medium flex items-center gap-1 mb-1">
                                                    {item.symbol ? (
                                                        <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-purple-500/10 text-purple-600 border-purple-200 uppercase">
                                                            {item.symbol}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-blue-500/10 text-blue-600 border-blue-200">
                                                            Portfolio
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="font-sm font-medium line-clamp-1">
                                                    {item.displayDate}
                                                </div>
                                                <div className="text-xs text-muted-foreground italic">
                                                    {item.symbol ? 'Stock Analysis' : 'Portfolio Review'}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => viewAnalysis(item)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => downloadAnalysisAsMarkdown(item)}
                                                        disabled={!selectedContent || selectedAnalysis?.id !== item.id}
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Download MD
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => downloadAnalysisAsPDF(item)}
                                                        disabled={!selectedContent || selectedAnalysis?.id !== item.id || downloadingPDF}
                                                    >
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteAnalysis(item)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Content View */}
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        {!selectedAnalysis ? (
                            <div className="flex items-center justify-center flex-1 text-muted-foreground">
                                <div className="text-center">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">Select an analysis to view</p>
                                </div>
                            </div>
                        ) : contentLoading ? (
                            <div className="flex items-center justify-center flex-1">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4 pb-4 border-b flex-shrink-0">
                                    <div>
                                        <h3 className="font-semibold text-base">{selectedAnalysis.displayDate}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(selectedAnalysis.timestamp).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadAnalysisAsMarkdown(selectedAnalysis)}
                                            title="Download as Markdown"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={downloadingPDF}
                                            onClick={() => downloadAnalysisAsPDF(selectedAnalysis)}
                                            className="gap-2 bg-purple-500/5 hover:bg-purple-500/10 border-purple-200"
                                        >
                                            {downloadingPDF ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <FileDown className="h-4 w-4 text-purple-600" />
                                            )}
                                            {downloadingPDF ? "Generating..." : "Download PDF"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteAnalysis(selectedAnalysis)}
                                            className="gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 min-h-0">
                                    <div className="pr-4 markdown-prose p-2" ref={contentRef}>
                                        {selectedContent && (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: (props) => (
                                                        <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props} />
                                                    ),
                                                    h2: (props) => (
                                                        <h2 className="text-xl font-semibold mb-3 mt-5 px-2 py-1 bg-muted/50 rounded-md border-l-4 border-purple-500" {...props} />
                                                    ),
                                                    h3: (props) => (
                                                        <h3 className="text-lg font-medium mb-2 mt-4 text-purple-600 dark:text-purple-400" {...props} />
                                                    ),
                                                    p: (props) => (
                                                        <p className="mb-3 text-muted-foreground leading-relaxed" {...props} />
                                                    ),
                                                    ul: (props) => (
                                                        <ul className="list-disc pl-5 mb-4 space-y-1 text-muted-foreground" {...props} />
                                                    ),
                                                    ol: (props) => (
                                                        <ol className="list-decimal pl-5 mb-4 space-y-1 text-muted-foreground" {...props} />
                                                    ),
                                                    li: (props) => <li className="pl-1" {...props} />,
                                                    strong: (props) => (
                                                        <strong className="font-semibold text-foreground" {...props} />
                                                    ),
                                                    blockquote: (props) => (
                                                        <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground my-4" {...props} />
                                                    ),
                                                    table: (props) => (
                                                        <div className="overflow-x-auto my-4 rounded-lg border">
                                                            <table className="w-full text-sm" {...props} />
                                                        </div>
                                                    ),
                                                    thead: (props) => (
                                                        <thead className="bg-muted text-muted-foreground font-medium" {...props} />
                                                    ),
                                                    tbody: (props) => (
                                                        <tbody className="divide-y" {...props} />
                                                    ),
                                                    tr: (props) => (
                                                        <tr className="hover:bg-muted/50 transition-colors" {...props} />
                                                    ),
                                                    th: (props) => (
                                                        <th className="p-3 text-left font-medium" {...props} />
                                                    ),
                                                    td: (props) => (
                                                        <td className="p-3 align-top" {...props} />
                                                    ),
                                                    code: (props) => (
                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                                    ),
                                                }}
                                            >
                                                {selectedContent}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </ScrollArea>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
