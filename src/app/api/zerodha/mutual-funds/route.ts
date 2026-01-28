import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const KITE_API_KEY = process.env.KITE_API_KEY || "YOUR_API_KEY";
const KITE_ACCESS_TOKEN = process.env.KITE_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN";

// Helper to call Kite Connect MF API
async function fetchKiteMFHoldings() {
    const url = "https://api.kite.trade/mf/holdings";
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
        console.error("Zerodha MF API error:", data);
        throw new Error(data.message || data.error || `Failed to fetch MF holdings (status ${res.status})`);
    }
    return data;
}

export async function GET(req: NextRequest) {
    try {
        const data = await fetchKiteMFHoldings();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
