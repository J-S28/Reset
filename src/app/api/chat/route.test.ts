import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateChatReply: vi.fn().mockResolvedValue("How are you feeling right now?"),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ ok: true, retryAfterMs: 0 }),
  clientKeyFromRequest: vi.fn().mockReturnValue("test-client"),
}));

import { POST } from "./route";
import { generateChatReply } from "@/lib/gemini";

function request(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for a missing messages array", async () => {
    const res = await POST(request({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an empty message text", async () => {
    const res = await POST(request({ messages: [{ role: "user", text: "" }] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const badRequest = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(badRequest);
    expect(res.status).toBe(400);
  });

  it("defaults to onboarding mode and returns the model's reply on valid input", async () => {
    const res = await POST(request({ messages: [{ role: "user", text: "Hi there" }] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe("How are you feeling right now?");
    expect(generateChatReply).toHaveBeenCalledWith(
      [{ role: "user", text: "Hi there" }],
      "onboarding",
    );
  });

  it("returns 502 with a gentle message when Gemini fails", async () => {
    vi.mocked(generateChatReply).mockRejectedValueOnce(new Error("upstream failure"));
    const res = await POST(request({ messages: [{ role: "user", text: "Hi there" }] }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toMatch(/trouble responding/i);
  });
});
