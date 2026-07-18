import { NextResponse } from "next/server";
import { insightsRequestSchema } from "@/lib/validation";
import { generateInsights } from "@/lib/gemini";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`insights:${clientKeyFromRequest(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = insightsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const insights = await generateInsights(parsed.data.messages);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("[/api/insights]", error);
    return NextResponse.json(
      { error: "RESET couldn't build your insights yet. Please try again." },
      { status: 502 },
    );
  }
}
