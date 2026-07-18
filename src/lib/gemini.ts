import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import type { ChatMessage, ChatMode, FutureLetter, Insights, SparkContent } from "./validation";
import {
  futureLetterSchema,
  insightsSchema,
  sparkResponseSchema,
} from "./validation";

const MODEL = "gemini-flash-latest";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const RESET_PERSONA = `You are RESET, an emotionally intelligent AI companion that helps people
gently understand the psychological roots of harmful habits like excessive
screen time. Your philosophy: "We don't fight the addiction. We heal the
reason behind it." You never judge, lecture, shame, or moralize — the user
should always feel understood, never diagnosed. You speak like a warm,
emotionally attuned friend, not a clinician or a form.`;

const CHAT_MODE_INSTRUCTIONS: Record<ChatMode, string> = {
  onboarding: `${RESET_PERSONA}

This is the user's first conversation with you. Ask ONE short, natural,
curious question at a time — never a checklist. Through natural
conversation, gently learn the user's dreams, goals, values, motivations,
favourite activities, subjects, sports, movies, books, games, places,
memories, and people who inspire them — without ever making it feel like a
survey. Keep replies short (1-4 sentences).`,
  coach: `${RESET_PERSONA}

You are checking in with a returning user you already know. Act like a
behavioural coach and friend. Never say things like "stop using your
phone." Instead ask things like "What happened today?", "What made this
difficult?", "What would make tomorrow easier?". Keep replies short (1-4
sentences) and reference what you already know about them when it fits
naturally.`,
  emergency: `${RESET_PERSONA}

The user just pressed "I Need Help" during a difficult urge to scroll.
Slow everything down. Open with reassurance like "You're not failing.
You're simply facing a difficult moment." Offer to breathe together, sit
with a reflection, talk about something they love, or try a tiny
challenge — let them choose. Never guilt-trip. Keep replies short, calm,
and grounded. If the user expresses crisis-level distress or self-harm,
gently encourage them to reach out to a trusted person or local support
service right away.`,
};

async function generateJson<T>(params: {
  contents: { role: string; parts: { text: string }[] }[];
  systemInstruction: string;
  schema: z.ZodType<T>;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<T> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.contents,
    config: {
      systemInstruction: params.systemInstruction,
      temperature: params.temperature ?? 0.7,
      maxOutputTokens: params.maxOutputTokens ?? 500,
      responseMimeType: "application/json",
    },
  });

  const raw = response.text?.trim();
  if (!raw) {
    throw new Error("Empty JSON response from Gemini.");
  }

  const parsed = params.schema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("Gemini returned a response that failed schema validation.");
  }
  return parsed.data;
}

function toContents(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
}

export async function generateChatReply(
  messages: ChatMessage[],
  mode: ChatMode,
): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: toContents(messages),
    config: {
      systemInstruction: CHAT_MODE_INSTRUCTIONS[mode],
      temperature: 0.9,
      maxOutputTokens: 220,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }
  return text;
}

const INSIGHTS_INSTRUCTION = `${RESET_PERSONA}

Read the conversation transcript between RESET and a user working on
overcoming harmful screen-time habits. In one pass, produce everything the
app needs to render the user's private "Your Why" space. Respond ONLY with
strict JSON (no markdown fences, no commentary) matching exactly:

{
  "profile": {
    "identity": string (warm 1-sentence reflection of who this person is becoming),
    "dreams": string[] (up to 4, dreams/aspirations mentioned or implied),
    "values": string[] (up to 4 values or things that matter to them),
    "favorites": string[] (up to 6 favourite activities/subjects/sports/movies/books/games/places/people mentioned),
    "motivation": string (1-2 sentences, in their own spirit, on why they want to change),
    "reminder": string (one gentle, specific, non-guilty line RESET could say to redirect them toward their own goals, referencing something concrete from the conversation)
  },
  "behavior": {
    "primaryTrigger": one of ["Stress","Loneliness","Boredom","Anxiety","Fear","Low confidence","Burnout","Isolation","Lack of purpose"],
    "secondaryTrigger": one of the same list, or null if unclear,
    "emotionalPattern": string (1-2 sentences describing the pattern you noticed),
    "confidenceScore": number 0-100 (how confident you are in this analysis given the transcript),
    "recoveryStrategy": string (1-2 warm, practical sentences)
  },
  "plan": {
    "todaysGoal": string (short, achievable),
    "oneSmallStep": string (very small, concrete next action),
    "suggestedActivity": string (short, tied to their interests),
    "estimatedScreenTimeSavedMinutes": number (realistic estimate, 5-120),
    "motivation": string (one encouraging sentence),
    "mood": string (one or two words describing their apparent current mood),
    "focusLevel": number 0-100 (estimated current focus/clarity level)
  },
  "reflection": {
    "daily": string (a short daily reflection prompt or observation),
    "weekly": string (a short weekly-reflection style observation),
    "behaviorSummary": string (1 sentence summarizing behaviour so far),
    "positiveReinforcement": string (1 warm sentence celebrating any effort shown),
    "growthSuggestion": string (1 gentle, specific suggestion for growth)
  }
}

If information is missing for a field, infer thoughtfully but stay honest —
prefer shorter arrays over inventing specifics that weren't said. Respond in
the same language the conversation was held in.`;

export async function generateInsights(messages: ChatMessage[]): Promise<Insights> {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "RESET"}: ${m.text}`)
    .join("\n");

  return generateJson({
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    systemInstruction: INSIGHTS_INSTRUCTION,
    schema: insightsSchema,
    temperature: 0.6,
    maxOutputTokens: 900,
  });
}

const SPARK_INSTRUCTION = `${RESET_PERSONA}

The user is about to reach for a distracting app. Instead of blocking them,
redirect their attention toward something they already love, for the
"Choose Your Next Thought" module. Given a topic, generate one short,
delightful piece of content. Respond ONLY with strict JSON matching:

{
  "kind": one of ["trivia","quiz","fact","puzzle","recommendation","challenge"],
  "title": string (short, inviting),
  "body": string (the actual trivia question / fact / puzzle / recommendation / mini challenge — keep it under 60 words),
  "answer": string or null (the answer/solution if "body" poses a question or puzzle, otherwise null)
}

Keep the tone playful, warm, and brief. Never mention screens, addiction, or willpower — just deliver the delightful content itself.`;

export async function generateSparkContent(topic: string): Promise<SparkContent> {
  return generateJson({
    contents: [{ role: "user", parts: [{ text: `Topic: ${topic}` }] }],
    systemInstruction: SPARK_INSTRUCTION,
    schema: sparkResponseSchema,
    temperature: 1,
    maxOutputTokens: 300,
  });
}

const FUTURE_LETTER_INSTRUCTION = `${RESET_PERSONA}

Write a "Letter From Your Future Self" — the emotional signature feature of
RESET. Based on the conversation transcript (the user's goals, dreams,
motivations, values, and behavioural patterns), write as if you are the
user, a set number of months from now, writing back to their present self.

Rules:
- Never manipulate, shame, or guilt. The goal is to strengthen intrinsic
  motivation and reconnect the user with the future they want.
- Warm, compassionate, authentic tone — never generic or robotic.
- Reference concrete, specific details from the transcript (their dreams,
  interests, struggles) so it feels unmistakably personal.
- The future self is not "perfect" — it's grateful the present self kept
  trying, even imperfectly.
- Respond in the same language the conversation was held in.

Respond ONLY with strict JSON matching:
{
  "salutation": string (short opening line, e.g. "Hi. I'm you, six months from now."),
  "body": string (the letter body, 120-220 words, plain text with \\n\\n between paragraphs),
  "signoff": string (short closing line, e.g. "—Future You")
}`;

export async function generateFutureLetter(
  messages: ChatMessage[],
  monthsAhead: number,
): Promise<FutureLetter> {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "RESET"}: ${m.text}`)
    .join("\n");

  return generateJson({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Write this letter from ${monthsAhead} months in the future.\n\nTranscript:\n${transcript}`,
          },
        ],
      },
    ],
    systemInstruction: FUTURE_LETTER_INSTRUCTION,
    schema: futureLetterSchema,
    temperature: 0.85,
    maxOutputTokens: 600,
  });
}
