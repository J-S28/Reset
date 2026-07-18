import { NextResponse } from "next/server";
import { chatRequestWithModeSchema } from "@/lib/validation";
import { generateChatReply } from "@/lib/gemini";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`chat:${clientKeyFromRequest(request)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "You're sending messages a little fast. Take a breath and try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatRequestWithModeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const reply = await generateChatReply(parsed.data.messages, parsed.data.mode);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[/api/chat]", error);
    return NextResponse.json(
      { error: "RESET is having trouble responding right now. Please try again in a moment." },
      { status: 502 },
    );
  }
}
