"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Lightbulb, Sparkle, Target, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { AmbientProgress } from "@/components/dashboard/AmbientProgress";
import { StatCard } from "@/components/dashboard/StatCard";
import { useResetStore } from "@/lib/store";

export default function WhyPage() {
  const router = useRouter();
  const { insights } = useResetStore();

  useEffect(() => {
    if (!insights) router.replace("/onboarding");
  }, [insights, router]);

  if (!insights) {
    return (
      <div className="relative flex min-h-full flex-1 items-center justify-center">
        <p className="text-foreground-muted">Loading your space…</p>
      </div>
    );
  }

  const { profile, behavior, plan } = insights;

  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <AuroraBackground calm className="opacity-60" />
      <Container className="relative pt-10">
        <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm text-foreground-muted hover:text-foreground">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-xs uppercase tracking-widest text-foreground-muted">Your Why</p>
          <h1 className="font-display mt-2 text-3xl sm:text-4xl">{profile.identity}</h1>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassCard glow="indigo" className="lg:col-span-2">
            <div className="flex items-center gap-2 text-foreground-muted">
              <Heart size={16} aria-hidden="true" />
              <h2 className="text-sm font-medium uppercase tracking-wide">What matters to you</h2>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.values.map((v) => (
                <li key={v} className="glass rounded-full px-4 py-1.5 text-sm">
                  {v}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-medium text-foreground-muted">Dreams you&apos;ve shared</h3>
            <ul className="mt-2 space-y-2">
              {profile.dreams.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Sparkle size={14} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>

            {profile.goals.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-medium text-foreground-muted">Where you&apos;re headed</h3>
                <ul className="mt-2 space-y-2">
                  {profile.goals.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-sm">
                      <Target size={14} className="mt-0.5 shrink-0 text-indigo-soft" aria-hidden="true" />
                      {g}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-6 text-sm font-medium text-foreground-muted">What lights you up</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {profile.favorites.map((f) => (
                <li key={f} className="rounded-full bg-white/5 px-3 py-1 text-xs text-foreground-muted">
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-indigo/10 p-4">
              <p className="text-sm">{profile.motivation}</p>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <GlassCard glow="amber">
              <p className="text-xs uppercase tracking-wide text-foreground-muted">RESET gently reminds you</p>
              <p className="font-display mt-2 text-lg">{profile.reminder}</p>
            </GlassCard>
            <AmbientProgress
              score={behavior.confidenceScore}
              label="Analysis confidence"
              description="How clearly RESET understands your pattern so far."
            />
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Root Cause Analysis</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Not a diagnosis — a gentle, honest read of WHY the habit shows up, not just what it is.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={Target} label="Primary trigger" value={behavior.primaryTrigger} />
            <StatCard
              icon={Target}
              label="Secondary trigger"
              value={behavior.secondaryTrigger ?? "Not yet clear"}
              glow="none"
            />
            <GlassCard className="sm:col-span-2">
              <h3 className="text-sm font-medium text-foreground-muted">Emotional pattern</h3>
              <p className="mt-2 text-sm">{behavior.emotionalPattern}</p>
              <h3 className="mt-4 text-sm font-medium text-foreground-muted">Recovery strategy</h3>
              <p className="mt-2 text-sm text-healing-soft">{behavior.recoveryStrategy}</p>
            </GlassCard>
            <GlassCard glow="none" className="flex items-start gap-3">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-foreground-muted">Why RESET thinks this</h3>
                <p className="mt-1 text-sm">{behavior.rationale}</p>
              </div>
            </GlassCard>
            <GlassCard glow="none" className="flex items-start gap-3">
              <TrendingUp size={16} className="mt-0.5 shrink-0 text-indigo-soft" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-foreground-muted">Likely next risk window</h3>
                <p className="mt-1 text-sm">{behavior.predictedRiskWindow}</p>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Your reset plan, today</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Target} label="Today's goal" value={plan.todaysGoal} />
            <StatCard icon={Sparkle} label="One small step" value={plan.oneSmallStep} glow="amber" />
            <StatCard icon={Heart} label="Suggested activity" value={plan.suggestedActivity} glow="healing" />
          </div>
        </section>
      </Container>
    </div>
  );
}
