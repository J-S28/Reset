"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Progress as a soft, glowing organic shape rather than a bar or streak
 * counter — it gets more vibrant and stable as the score rises, and simply
 * softens (never breaks or turns red) if the score dips. Nothing here can
 * look like "failure."
 */
export function AmbientProgress({
  score,
  label,
  description,
}: {
  score: number;
  label: string;
  description: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const scale = 0.7 + (clamped / 100) * 0.5;
  const saturation = 0.35 + (clamped / 100) * 0.65;

  return (
    <GlassCard glow="healing" className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <motion.span
          className="absolute h-28 w-28 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(163,230,53,0.9) 0%, rgba(79,70,229,0.5) 60%, transparent 80%)",
            opacity: saturation,
          }}
          animate={{ scale: [scale * 0.94, scale, scale * 0.94] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <span className="font-display relative text-2xl">{Math.round(clamped)}</span>
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-foreground-muted">{description}</p>
      </div>
    </GlassCard>
  );
}
