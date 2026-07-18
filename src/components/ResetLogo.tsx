"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ResetLogoProps {
  size?: number;
  className?: string;
  /** Play the 2s transformation once on mount instead of resting in the final state. */
  animate?: boolean;
}

// Precomputed (not derived from Math.cos/sin at render time): transcendental
// function precision isn't guaranteed bit-identical across JS engines, which
// previously caused a real SSR/client hydration mismatch on this exact kind
// of trig-seeded layout — see ParticleField's seededRandom for the same
// lesson. These 9 points are fixed anyway, so baking them in sidesteps the
// whole class of bug.
const PARTICLES = [
  { seed: 0, startX: 132, startY: 132, haloX: 144, haloY: 62, delay: 0.55 },
  { seed: 1, startX: 131.845, startY: 133.1025, haloX: 137.9172, haloY: 73.5702, delay: 0.62 },
  { seed: 2, startX: 131.3922, startY: 134.1197, haloX: 122.5149, haloY: 79.7265, delay: 0.69 },
  { seed: 3, startX: 130.6765, startY: 134.9726, haloX: 105, haloY: 77.5885, delay: 0.76 },
  { seed: 4, startX: 129.7535, startY: 135.5952, haloX: 93.568, haloY: 68.1564, delay: 0.83 },
  { seed: 5, startX: 128.6946, startY: 135.9392, haloX: 93.568, haloY: 55.8436, delay: 0.55 },
  { seed: 6, startX: 127.5819, startY: 135.9781, haloX: 105, haloY: 46.4115, delay: 0.62 },
  { seed: 7, startX: 126.5016, startY: 135.7087, haloX: 122.5149, haloY: 44.2735, delay: 0.69 },
  { seed: 8, startX: 125.5374, startY: 135.152, haloX: 137.9172, haloY: 50.4298, delay: 0.76 },
] as const;

/**
 * The RESET mark: a single silhouette that transforms from bent-over,
 * phone-lit, and closed, into upright, open, and haloed — over ~2s. Reduced
 * motion / non-animated contexts render straight into the resolved (upright)
 * state rather than replaying the story.
 */
export function ResetLogo({ size = 96, className, animate = true }: ResetLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  const particles = PARTICLES;

  return (
    <svg
      role="img"
      aria-label="RESET — a bent silhouette rising into an open, upright posture with a soft halo of clarity"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn("overflow-visible", className)}
    >
      <defs>
        <radialGradient id="reset-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="reset-figure" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <motion.ellipse
        cx="100"
        cy="176"
        rx="34"
        ry="6"
        fill="#000000"
        initial={shouldAnimate ? { opacity: 0.25, rx: 26 } : false}
        animate={{ opacity: 0.15, rx: 34 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* neural halo, resolves in behind the upright head */}
      <motion.circle
        cx="118"
        cy="62"
        r="30"
        fill="url(#reset-halo)"
        initial={shouldAnimate ? { opacity: 0, scale: 0.6 } : false}
        animate={
          shouldAnimate
            ? { opacity: [0, 0, 0.9, 0.7], scale: [0.6, 0.6, 1.05, 1] }
            : { opacity: 0.7, scale: 1 }
        }
        transition={{ duration: 2, times: [0, 0.6, 0.85, 1], ease: "easeOut" }}
        style={{ transformOrigin: "118px 62px" }}
      />

      {/* the figure: rotates from bent-forward to upright as one group */}
      <motion.g
        initial={shouldAnimate ? { rotate: -14, x: -6, y: 4 } : false}
        animate={{ rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "100px 150px" }}
      >
        {/* torso + legs */}
        <path
          d="M100 96c-14 0-22 12-22 28v26c0 14 8 24 22 24s22-10 22-24v-26c0-16-8-28-22-28z"
          fill="url(#reset-figure)"
        />
        {/* head */}
        <motion.circle
          cx="100"
          cy="70"
          r="18"
          fill="url(#reset-figure)"
          initial={shouldAnimate ? { cy: 76 } : false}
          animate={{ cy: 70 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.g>

      {/* phone glow, present only at the start of the story */}
      <motion.rect
        x="118"
        y="118"
        width="16"
        height="26"
        rx="4"
        fill="#0f172a"
        stroke="#a3e635"
        strokeWidth="1.5"
        initial={shouldAnimate ? { opacity: 0.9 } : { opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, times: [0, 0.35, 1], ease: "easeIn" }}
      />

      {/* particles: phone dissolves into light, light becomes the halo */}
      {shouldAnimate &&
        particles.map((p) => (
          <motion.circle
            key={p.seed}
            r={1.6}
            fill="#a3e635"
            initial={{ cx: p.startX, cy: p.startY, opacity: 0 }}
            animate={{
              cx: [p.startX, p.startX, p.haloX],
              cy: [p.startY, p.startY, p.haloY],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 1.1,
              delay: p.delay,
              ease: "easeOut",
              times: [0, 0.15, 1],
            }}
          />
        ))}
    </svg>
  );
}
