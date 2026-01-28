import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { Holding } from "@/lib/types";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const filePath = path.join(process.cwd(), 'Vested_Holdings.xlsx');
        console.log(`Vested API: Attempting to read file at ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`Vested API: File not found at ${filePath}`);
            return NextResponse.json({ error: "File not found", path: filePath }, { status: 404 });
        }

        // Read file buffer first to avoid file lock issues
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Vested API: Found ${jsonData.length} rows`);

        const holdings: Holding[] = jsonData.map(row => {
            // Debug log for first row to ensure keys match
            if (jsonData.indexOf(row) === 0) {
                console.log("Vested API: First row keys:", Object.keys(row));
            }

            return {
                tradingsymbol: row['Ticker'] ? String(row['Ticker']) : 'UNKNOWN',
                quantity: Number(row['Total Shares Held']) || 0,
                average_price: Number(row['Average Cost (USD)']) || 0,
                last_price: Number(row['Current Price (USD)']) || 0,
                pnl: Number(row['Investment Returns (USD)']) || 0,
                day_change: Number(row['Daily Change (USD)']) || 0,
                day_change_percentage: Number(row['Daily Change (%)']),
                currency: 'USD',
                exchange: 'US', // Generic exchange for US stocks
                type: 'equity',
                sector: 'International' // Map to existing sector category
            };
        });

        console.log(`Vested API: Returning ${holdings.length} holdings`);
        return NextResponse.json({ data: holdings }); // Consistently wrapping data, check other API routes if they wrap or return array directly?
    } catch (e: any) {
        console.error("Vested API error:", e);
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
