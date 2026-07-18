# RESET

**Reset your habits. Reclaim your life.**

RESET is an emotionally intelligent AI companion for the PromptWars "Breaking
Bad Habits & Addiction" challenge. Instead of blocking distractions, it
understands the psychological root causes behind harmful habits — stress,
loneliness, boredom, anxiety — and gently redirects the user toward the life
they actually want, through conversation, not restriction.

> We don't fight the addiction. We heal the reason behind it.

## Flow

Landing → **The Reset Conversation** (conversational onboarding, no forms) →
**AI Processing** (Gemini builds a Purpose Profile, root-cause analysis, and a
reset plan in one pass) → **Dashboard** (mood, focus score, behaviour trends,
"Choose Your Next Thought") → **Your Why** (purpose profile + root cause
detection) → **Letter From Your Future Self**. A floating **RESET Coach** and
an **"I Need Help"** emergency reset are available throughout.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) ·
Tailwind CSS v4 · Framer Motion · React Hook Form · Zod · Recharts ·
Gemini API (`@google/genai`, server-side only)

## Getting started

```bash
npm install
cp .env.example .env.local   # then set GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Architecture notes

- **Security**: all Gemini calls happen server-side in Route Handlers behind
  Zod validation and a per-IP in-memory rate limiter; secrets never reach the
  client (`GEMINI_API_KEY` is read only in `server-only`-guarded modules).
- **Efficiency**: onboarding produces the purpose profile, root-cause
  analysis, reset plan, and reflections in a single Gemini call
  (`/api/insights`) rather than four; heavy client components (charts, the
  logo animation) are dynamically imported.
- **Accessibility**: semantic landmarks, skip link, visible focus rings,
  `prefers-reduced-motion` and `prefers-contrast` support, live regions for
  chat and async states, keyboard-operable everywhere.
- **Multilingual**: UI copy and the Gemini persona both respond in the
  user's language (English, Spanish, Hindi, French, Portuguese out of the
  box).
- **Testing**: Vitest + Testing Library cover validation schemas, shared UI
  components, and API route behaviour (mocked Gemini/rate-limit modules).
