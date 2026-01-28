import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Set your API key and secret here or use environment variables for security
const KITE_API_KEY = process.env.KITE_API_KEY || "YOUR_API_KEY";
const KITE_API_SECRET = process.env.KITE_API_SECRET || "YOUR_API_SECRET";
const KITE_ACCESS_TOKEN = process.env.KITE_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN";

// Helper to call Kite Connect API
async function fetchKiteHoldings() {
    const url = "https://api.kite.trade/portfolio/holdings";
    const res = await fetch(url, {
        headers: {
            "X-Kite-Version": "3",
            Authorization: `token ${KITE_API_KEY}:${KITE_ACCESS_TOKEN}`,
        },
        cache: 'no-store',
    });
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = { error: "Failed to parse response", status: res.status };
    }
    if (!res.ok) {
        // Log the error for debugging
        console.error("Zerodha API error:", data);
        throw new Error(data.message || data.error || `Failed to fetch holdings (status ${res.status})`);
    }
    return data;
}

export async function GET(req: NextRequest) {
    try {
        const data = await fetchKiteHoldings();
        return NextResponse.json(data);
    } catch (e: any) {
        // Return the error message and stack for debugging
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
