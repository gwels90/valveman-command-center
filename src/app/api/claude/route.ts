import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter: max 20 requests per hour
const requestLog: number[] = [];
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove entries older than the window
  while (requestLog.length > 0 && requestLog[0] < now - WINDOW_MS) {
    requestLog.shift();
  }
  if (requestLog.length >= RATE_LIMIT) {
    return true;
  }
  requestLog.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  if (isRateLimited()) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 20 requests per hour." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Proxy error", details: message },
      { status: 500 }
    );
  }
}
