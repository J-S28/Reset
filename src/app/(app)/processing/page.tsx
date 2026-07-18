"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ParticleField } from "@/components/ui/ParticleField";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { resetStore } from "@/lib/store";
import type { Insights } from "@/lib/validation";

const STAGES = [
  "Understanding emotions",
  "Analysing behaviour",
  "Finding triggers",
  "Building purpose profile",
  "Designing recovery plan",
  "Generating nudges",
  "Preparing dashboard",
];

const STAGE_INTERVAL_MS = 650;

export default function ProcessingPage() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const insightsRef = useRef<Insights | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const messages = resetStore.getOnboardingMessages();
    if (messages.filter((m) => m.role === "user").length === 0) {
      router.replace("/onboarding");
      return;
    }

    const stageTimer = window.setInterval(() => {
      setActiveStage((s) => Math.min(s + 1, STAGES.length));
    }, STAGE_INTERVAL_MS);

    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Something went wrong building your insights.");
        }
        const data = await res.json();
        insightsRef.current = data.insights as Insights;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => window.clearInterval(stageTimer);
  }, [router]);

  useEffect(() => {
    if (navigatedRef.current || error) return;
    if (activeStage >= STAGES.length && insightsRef.current) {
      navigatedRef.current = true;
      resetStore.setInsights(insightsRef.current);
      const t = window.setTimeout(() => router.push("/dashboard"), 500);
      return () => window.clearTimeout(t);
    }
  }, [activeStage, error, router]);

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center py-16">
      <AuroraBackground calm />
      <ParticleField count={14} slow />
      <Container className="relative flex justify-center">
        <GlassCard strong className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <span className="animate-breathe absolute h-16 w-16 rounded-full bg-indigo/25 blur-xl" aria-hidden="true" />
            <Loader2 className="relative animate-spin text-indigo-soft" size={28} aria-hidden="true" />
          </div>

          <h1 className="font-display text-2xl">RESET is listening</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Turning your words into a plan built around who you are.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-left" aria-label="Analysis progress">
            {STAGES.map((stage, i) => {
              const done = i < activeStage;
              const current = i === activeStage;
              return (
                <motion.li
                  key={stage}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: done || current ? 1 : 0.35 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-healing text-midnight-deep" : "glass"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <Check size={14} /> : current ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-soft" />
                    ) : null}
                  </span>
                  <span className={done ? "text-foreground" : "text-foreground-muted"}>{stage}</span>
                </motion.li>
              );
            })}
          </ul>

          {error && (
            <div role="alert" className="mt-6 space-y-3">
              <p className="text-sm text-amber">{error}</p>
              <Button size="md" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          )}
        </GlassCard>
      </Container>
    </div>
  );
}
