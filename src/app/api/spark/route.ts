import { NextResponse } from "next/server";
import { sparkRequestSchema } from "@/lib/validation";
import { generateSparkContent } from "@/lib/gemini";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`spark:${clientKeyFromRequest(request)}`, {
    limit: 20,
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

  const parsed = sparkRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const spark = await generateSparkContent(parsed.data.topic);
    return NextResponse.json({ spark });
  } catch (error) {
    console.error("[/api/spark]", error);
    return NextResponse.json(
      { error: "Couldn't generate that right now. Please try again." },
      { status: 502 },
    );
  }
}
