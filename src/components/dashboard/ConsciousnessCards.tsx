"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SPARK_TOPICS, type SparkContent } from "@/lib/validation";

/**
 * "Choose Your Next Thought" — instead of blocking the distracting app,
 * redirect attention toward something the user already loves.
 */
export function ConsciousnessCards({ favorites }: { favorites: string[] }) {
  const topics = favorites.length > 0 ? favorites.slice(0, 6) : [...SPARK_TOPICS];
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [content, setContent] = useState<SparkContent | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(topic: string) {
    setActiveTopic(topic);
    setContent(null);
    setRevealAnswer(false);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error("Couldn't generate that right now.");
      const data = await res.json();
      setContent(data.spark as SparkContent);
    } catch {
      setError("RESET couldn't come up with something just now. Try another topic?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard glow="amber" className="col-span-full">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-amber" aria-hidden="true" />
        <h3 className="text-sm font-medium text-foreground-muted">Choose Your Next Thought</h3>
      </div>
      <p className="mt-1 text-xs text-foreground-muted">
        A quick redirect toward something you already love — instead of the scroll.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pick a topic">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => choose(topic)}
            className={`focus-ring rounded-full px-4 py-2 text-xs transition-colors ${
              activeTopic === topic ? "bg-amber text-midnight-deep" : "glass text-foreground-muted hover:text-foreground"
            }`}
            aria-pressed={activeTopic === topic}
          >
            {topic}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-foreground-muted"
            aria-live="polite"
          >
            Finding something good…
          </motion.p>
        )}

        {error && (
          <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert" className="mt-4 text-sm text-amber">
            {error}
          </motion.p>
        )}

        {content && !loading && (
          <motion.div
            key={content.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mt-4 rounded-2xl p-4"
          >
            <p className="text-xs uppercase tracking-wide text-foreground-muted">{content.kind}</p>
            <p className="mt-1 font-medium">{content.title}</p>
            <p className="mt-2 text-sm text-foreground-muted">{content.body}</p>
            {content.answer && (
              <div className="mt-3">
                {revealAnswer ? (
                  <p className="text-sm text-healing-soft">{content.answer}</p>
                ) : (
                  <Button
                    variant="ghost"
                    size="md"
                    className="!px-0 gap-1.5"
                    onClick={() => setRevealAnswer(true)}
                  >
                    <Eye size={14} aria-hidden="true" />
                    Reveal answer
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
