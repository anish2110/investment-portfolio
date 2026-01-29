import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ANALYSES_DIR = path.join(process.cwd(), "public", "analyses");

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // Security: Validate filename to prevent directory traversal
        if (filename.includes("..") || filename.includes("/")) {
            return NextResponse.json(
                { error: "Invalid filename" },
                { status: 400 }
            );
        }

        const filepath = path.join(ANALYSES_DIR, `${filename}.md`);

        // Read the file
        const content = await fs.readFile(filepath, "utf-8");

        return NextResponse.json({
            filename: `${filename}.md`,
            content,
        });
    } catch (error) {
        console.error("Error reading analysis file:", error);
        return NextResponse.json(
            { error: "Analysis not found" },
            { status: 404 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // Security: Validate filename to prevent directory traversal
        if (filename.includes("..") || filename.includes("/")) {
            return NextResponse.json(
                { error: "Invalid filename" },
                { status: 400 }
            );
        }

        const filepath = path.join(ANALYSES_DIR, `${filename}.md`);

        // Delete the file
        await fs.unlink(filepath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting analysis file:", error);
        return NextResponse.json(
            { error: "Failed to delete analysis" },
            { status: 500 }
        );
    }
}
