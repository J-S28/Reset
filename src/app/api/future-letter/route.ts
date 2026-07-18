import { NextResponse } from "next/server";
import { futureLetterRequestSchema } from "@/lib/validation";
import { generateFutureLetter } from "@/lib/gemini";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`future-letter:${clientKeyFromRequest(request)}`, {
    limit: 8,
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

  const parsed = futureLetterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const letter = await generateFutureLetter(parsed.data.messages, parsed.data.monthsAhead);
    return NextResponse.json({ letter });
  } catch (error) {
    console.error("[/api/future-letter]", error);
    return NextResponse.json(
      { error: "RESET couldn't write your letter yet. Please try again." },
      { status: 502 },
    );
  }
}
