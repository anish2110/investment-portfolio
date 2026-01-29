import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ANALYSES_DIR = path.join(process.cwd(), "public", "analyses");

export async function GET() {
    try {
        // Ensure directory exists
        await fs.mkdir(ANALYSES_DIR, { recursive: true });

        // Read all markdown files from the analyses directory
        const files = await fs.readdir(ANALYSES_DIR);
        const mdFiles = files.filter((file) => file.endsWith(".md"));

        // Sort by date (newest first) and extract metadata
        const analyses = mdFiles
            .map((file) => {
                // Extract symbol and timestamp from filename 
                // format: analysis-TIMESTAMP.md OR analysis-SYMBOL-TIMESTAMP.md
                const match = file.match(/analysis-(?:(.*)-)?(\d+)\.md/);
                if (!match) return null;

                const symbol = match[1] || null;
                const timestamp = parseInt(match[2]);
                const date = new Date(timestamp);

                return {
                    id: file.replace(".md", ""),
                    filename: file,
                    symbol,
                    timestamp,
                    date: date.toISOString(),
                    displayDate: date.toLocaleDateString("en-IN", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
            })
            .filter((item) => item !== null)
            .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));

        return NextResponse.json({ analyses });
    } catch (error) {
        console.error("Error reading analyses history:", error);
        return NextResponse.json(
            { error: "Failed to read analyses history" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { content, symbol, type } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: "Analysis content is required" },
                { status: 400 }
            );
        }

        // Create analyses directory if it doesn't exist
        await fs.mkdir(ANALYSES_DIR, { recursive: true });

        // Generate filename with timestamp
        const timestamp = Date.now();
        const filename = symbol
            ? `analysis-${symbol.toUpperCase()}-${timestamp}.md`
            : `analysis-${timestamp}.md`;
        const filepath = path.join(ANALYSES_DIR, filename);

        // Add metadata header to the markdown
        const title = symbol ? `${symbol.toUpperCase()} Analysis` : "Portfolio Analysis";
        const contentWithMetadata = `# ${title}
**Generated:** ${new Date(timestamp).toLocaleString("en-IN")}

---

${content}`;

        // Save the file
        await fs.writeFile(filepath, contentWithMetadata, "utf-8");

        return NextResponse.json({
            success: true,
            filename,
            timestamp,
            displayDate: new Date(timestamp).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }),
        });
    } catch (error) {
        console.error("Error saving analysis:", error);
        return NextResponse.json(
            { error: "Failed to save analysis" },
            { status: 500 }
        );
    }
}
