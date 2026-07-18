import { describe, expect, it } from "vitest";
import {
  chatMessageSchema,
  chatRequestWithModeSchema,
  insightsSchema,
  sanitizeText,
  sparkRequestSchema,
} from "./validation";

describe("sanitizeText", () => {
  it("strips control characters but keeps normal punctuation and unicode", () => {
    const bell = String.fromCharCode(7);
    const withControlChars = `Hi${bell}there — I feel okay today. 你好`;
    expect(sanitizeText(withControlChars)).toBe("Hithere — I feel okay today. 你好");
  });

  it("keeps tabs and newlines", () => {
    expect(sanitizeText("line one\nline two\tindented")).toBe("line one\nline two\tindented");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeText("   hello world   ")).toBe("hello world");
  });
});

describe("chatMessageSchema", () => {
  it("accepts a valid user message", () => {
    const result = chatMessageSchema.safeParse({ role: "user", text: "hello" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = chatMessageSchema.safeParse({ role: "user", text: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    const result = chatMessageSchema.safeParse({ role: "user", text: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const result = chatMessageSchema.safeParse({ role: "system", text: "hello" });
    expect(result.success).toBe(false);
  });
});

describe("chatRequestWithModeSchema", () => {
  it("defaults mode to onboarding when omitted", () => {
    const result = chatRequestWithModeSchema.safeParse({
      messages: [{ role: "user", text: "hi" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("onboarding");
    }
  });

  it("rejects an unknown mode", () => {
    const result = chatRequestWithModeSchema.safeParse({
      messages: [{ role: "user", text: "hi" }],
      mode: "villain",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty messages array", () => {
    const result = chatRequestWithModeSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });
});

describe("sparkRequestSchema", () => {
  it("sanitizes the topic text", () => {
    const result = sparkRequestSchema.safeParse({ topic: "Football " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topic).toBe("Football");
    }
  });

  it("rejects an empty topic", () => {
    const result = sparkRequestSchema.safeParse({ topic: "" });
    expect(result.success).toBe(false);
  });
});

describe("insightsSchema", () => {
  const validInsights = {
    profile: {
      identity: "Someone learning to slow down.",
      dreams: ["Become a doctor"],
      values: ["Honesty"],
      favorites: ["Football"],
      motivation: "To make their family proud.",
      reminder: "You wanted to learn AI — want a fact instead?",
    },
    behavior: {
      primaryTrigger: "Boredom",
      secondaryTrigger: null,
      emotionalPattern: "Reaches for the phone when unoccupied.",
      confidenceScore: 72,
      recoveryStrategy: "Keep a small notebook nearby for idle moments.",
    },
    plan: {
      todaysGoal: "Read for 10 minutes",
      oneSmallStep: "Open the book on the nightstand",
      suggestedActivity: "A short walk",
      estimatedScreenTimeSavedMinutes: 25,
      motivation: "Every small step counts.",
      mood: "Hopeful",
      focusLevel: 64,
    },
    reflection: {
      daily: "Today you noticed the urge before acting on it.",
      weekly: "This week you're building awareness.",
      behaviorSummary: "Boredom is the main driver right now.",
      positiveReinforcement: "You showed up and talked honestly today.",
      growthSuggestion: "Try noticing the moment right before you reach for your phone.",
    },
  };

  it("accepts a fully valid insights object", () => {
    expect(insightsSchema.safeParse(validInsights).success).toBe(true);
  });

  it("rejects an invalid trigger enum value", () => {
    const invalid = {
      ...validInsights,
      behavior: { ...validInsights.behavior, primaryTrigger: "Hunger" },
    };
    expect(insightsSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a confidenceScore outside 0-100", () => {
    const invalid = {
      ...validInsights,
      behavior: { ...validInsights.behavior, confidenceScore: 140 },
    };
    expect(insightsSchema.safeParse(invalid).success).toBe(false);
  });
});
