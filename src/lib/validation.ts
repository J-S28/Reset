import { z } from "zod";

/**
 * Strips control characters and trims whitespace before any user-supplied
 * text is forwarded to the model or persisted client-side. Tabs, newlines
 * and carriage returns are kept; everything else below 0x20, plus 0x7F, is
 * dropped.
 */
export function sanitizeText(input: string): string {
  let result = "";
  for (const char of input) {
    const code = char.codePointAt(0) ?? 0;
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    const isPrintable = code >= 32 && code !== 127;
    if (isAllowedWhitespace || isPrintable) {
      result += char;
    }
  }
  return result.trim();
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long.")
    .transform(sanitizeText),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required.")
    .max(40, "Conversation is too long for a single request."),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const purposeProfileRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(2, "Need at least one exchange to build a purpose profile.")
    .max(40, "Conversation is too long for a single request."),
});

export const purposeProfileSchema = z.object({
  identity: z.string().max(300),
  dreams: z.array(z.string().max(200)).max(6),
  values: z.array(z.string().max(120)).max(6),
  favorites: z.array(z.string().max(120)).max(8),
  motivation: z.string().max(400),
  reminder: z.string().max(300),
});

export type PurposeProfile = z.infer<typeof purposeProfileSchema>;

export const TRIGGER_OPTIONS = [
  "Stress",
  "Loneliness",
  "Boredom",
  "Anxiety",
  "Fear",
  "Low confidence",
  "Burnout",
  "Isolation",
  "Lack of purpose",
] as const;

export const behaviorAnalysisSchema = z.object({
  primaryTrigger: z.enum(TRIGGER_OPTIONS),
  secondaryTrigger: z.enum(TRIGGER_OPTIONS).nullable(),
  emotionalPattern: z.string().max(300),
  confidenceScore: z.number().min(0).max(100),
  recoveryStrategy: z.string().max(400),
});

export type BehaviorAnalysis = z.infer<typeof behaviorAnalysisSchema>;

export const resetPlanSchema = z.object({
  todaysGoal: z.string().max(160),
  oneSmallStep: z.string().max(200),
  suggestedActivity: z.string().max(160),
  estimatedScreenTimeSavedMinutes: z.number().min(0).max(600),
  motivation: z.string().max(300),
  mood: z.string().max(60),
  focusLevel: z.number().min(0).max(100),
});

export type ResetPlan = z.infer<typeof resetPlanSchema>;

export const reflectionSchema = z.object({
  daily: z.string().max(300),
  weekly: z.string().max(300),
  behaviorSummary: z.string().max(300),
  positiveReinforcement: z.string().max(200),
  growthSuggestion: z.string().max(250),
});

export type Reflection = z.infer<typeof reflectionSchema>;

export const insightsSchema = z.object({
  profile: purposeProfileSchema,
  behavior: behaviorAnalysisSchema,
  plan: resetPlanSchema,
  reflection: reflectionSchema,
});

export type Insights = z.infer<typeof insightsSchema>;

export const insightsRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(2, "Need at least one exchange to build your insights.")
    .max(40, "Conversation is too long for a single request."),
});

export const chatModeSchema = z.enum(["onboarding", "coach", "emergency"]);

export const chatRequestWithModeSchema = chatRequestSchema.extend({
  mode: chatModeSchema.default("onboarding"),
});

export const SPARK_TOPICS = [
  "Football",
  "Marvel",
  "AI",
  "Chess",
  "Anime",
  "Music",
  "Coding",
  "Photography",
] as const;

export const sparkRequestSchema = z.object({
  topic: z.string().min(1).max(60).transform(sanitizeText),
});

export const sparkResponseSchema = z.object({
  kind: z.enum(["trivia", "quiz", "fact", "puzzle", "recommendation", "challenge"]),
  title: z.string().max(120),
  body: z.string().max(500),
  answer: z.string().max(300).nullable(),
});

export type SparkContent = z.infer<typeof sparkResponseSchema>;

export const futureLetterRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(2)
    .max(40),
  monthsAhead: z.number().int().min(1).max(24).default(6),
});

export const futureLetterSchema = z.object({
  salutation: z.string().max(100),
  body: z.string().max(1600),
  signoff: z.string().max(100),
});

export type FutureLetter = z.infer<typeof futureLetterSchema>;
