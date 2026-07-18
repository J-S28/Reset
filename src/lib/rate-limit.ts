import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory per-instance limiter: fine for a single Next.js server/demo
// deployment, but resets on redeploy and won't coordinate across multiple
// serverless instances. Good enough to blunt casual abuse of the Gemini
// routes without adding external infra during the hackathon window.
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  { limit = 20, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "anonymous";
}
