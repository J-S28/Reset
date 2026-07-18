"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

/**
 * Deterministic pseudo-random in [0, 1), seeded by two small integers.
 * Integer-only (Math.imul + bitwise ops), so it's exact per the ES spec and
 * produces bit-identical output on server and client — unlike a
 * Math.sin-based hash, whose transcendental-function precision isn't
 * guaranteed to match across JS engines and previously caused a real
 * SSR/client hydration mismatch here.
 */
function seededRandom(a: number, b: number): number {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b ^ 0x27d4eb2f, 0xc2b2ae35);
  x ^= x >>> 15;
  x = Math.imul(x, 0x735a2d97);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

function buildParticles(count: number, slow: boolean): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: seededRandom(id, 0) * 100,
    size: 2 + seededRandom(id, 1) * 4,
    delay: seededRandom(id, 2) * 6,
    duration: (slow ? 12 : 6) + seededRandom(id, 3) * 4,
    opacity: 0.3 + seededRandom(id, 4) * 0.4,
  }));
}

/**
 * Lightweight CSS-driven particle field (no per-frame JS) so it stays cheap
 * even on the emergency-reset overlay where many other things are animating.
 */
export function ParticleField({
  count = 18,
  className,
  slow = false,
}: {
  count?: number;
  className?: string;
  slow?: boolean;
}) {
  const particles = useMemo(() => buildParticles(count, slow), [count, slow]);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="animate-float-particle absolute bottom-0 rounded-full bg-mist"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--particle-opacity" as string]: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
