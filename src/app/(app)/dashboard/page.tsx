"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smile,
  Clock,
  Target,
  Compass,
  Heart,
  Mail,
  ArrowRight,
  BookOpenText,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { StatCard } from "@/components/dashboard/StatCard";
import { AmbientProgress } from "@/components/dashboard/AmbientProgress";
import { ConsciousnessCards } from "@/components/dashboard/ConsciousnessCards";
import { useResetStore } from "@/lib/store";

const BehaviorTrendChart = dynamic(
  () => import("@/components/dashboard/BehaviorTrendChart").then((m) => m.BehaviorTrendChart),
  {
    ssr: false,
    loading: () => (
      <GlassCard className="col-span-full h-56 animate-pulse" glow="none" />
    ),
  },
);

export default function DashboardPage() {
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

  const { profile, behavior, plan, reflection } = insights;

  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <AuroraBackground calm className="opacity-60" />
      <Container className="relative pt-10">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-3xl">Your quiet progress</h1>
          <p className="text-foreground-muted">No streaks to fear breaking. Just where you are, gently.</p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Smile} label="Mood" value={plan.mood} hint={plan.motivation} />
          <AmbientProgress score={plan.focusLevel} label="Focus Score" description="How clear and present you feel right now." />
          <StatCard
            icon={Clock}
            label="Screen time saved"
            value={`${plan.estimatedScreenTimeSavedMinutes} min`}
            hint="Estimated for today"
            glow="healing"
          />
          <StatCard
            icon={Target}
            label="Today's goal"
            value={plan.todaysGoal}
            hint={plan.oneSmallStep}
            glow="amber"
          />

          <BehaviorTrendChart currentFocus={plan.focusLevel} />

          <StatCard
            icon={Compass}
            label="Most common trigger"
            value={behavior.primaryTrigger}
            hint={behavior.emotionalPattern}
          />
          <StatCard
            icon={Heart}
            label="Most helpful activity"
            value={plan.suggestedActivity}
            hint={behavior.recoveryStrategy}
            glow="healing"
          />

          <GlassCard className="sm:col-span-2">
            <h3 className="text-sm font-medium text-foreground-muted">Weekly reflection</h3>
            <p className="mt-2 text-sm">{reflection.weekly}</p>
          </GlassCard>
          <GlassCard className="sm:col-span-2" glow="healing">
            <h3 className="text-sm font-medium text-foreground-muted">AI summary</h3>
            <p className="mt-2 text-sm">{reflection.behaviorSummary}</p>
            <p className="mt-2 text-sm text-healing-soft">{reflection.positiveReinforcement}</p>
            <p className="mt-2 text-sm text-foreground-muted">{reflection.growthSuggestion}</p>
          </GlassCard>

          <ConsciousnessCards favorites={profile.favorites} />

          <Link href="/why" className="focus-ring col-span-full rounded-3xl sm:col-span-2">
            <GlassCard glow="indigo" className="flex h-full items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <BookOpenText size={16} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-wide">Your Why</span>
                </div>
                <p className="mt-2 text-sm">{profile.reminder}</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-foreground-muted" aria-hidden="true" />
            </GlassCard>
          </Link>

          <Link href="/letter" className="focus-ring col-span-full rounded-3xl sm:col-span-2">
            <GlassCard glow="amber" className="flex h-full items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Mail size={16} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-wide">A letter from your future self</span>
                </div>
                <p className="mt-2 text-sm">Written just for you, based on everything you&apos;ve shared.</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-foreground-muted" aria-hidden="true" />
            </GlassCard>
          </Link>
        </div>
      </Container>
    </div>
  );
}
