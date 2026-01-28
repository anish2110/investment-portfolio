import { NextRequest, NextResponse } from "next/server";

// Set your API key and secret here or use environment variables for security
const KITE_API_KEY = process.env.KITE_API_KEY || "YOUR_API_KEY";
const KITE_API_SECRET = process.env.KITE_API_SECRET || "YOUR_API_SECRET";

// This endpoint exchanges a request_token for an access_token
export async function POST(req: NextRequest) {
    const { request_token } = await req.json();
    if (!request_token) {
        return NextResponse.json({ error: "Missing request_token" }, { status: 400 });
    }
    const url = "https://api.kite.trade/session/token";
    const body = new URLSearchParams({
        api_key: KITE_API_KEY,
        request_token,
        api_secret: KITE_API_SECRET,
    });
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json({ error: data.message || "Failed to get access token" }, { status: 500 });
    }
    return NextResponse.json(data);
}
