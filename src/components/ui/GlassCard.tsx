"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type GlassCardProps = HTMLMotionProps<"div"> & {
  strong?: boolean;
  glow?: "indigo" | "healing" | "amber" | "none";
};

const glowClasses: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  indigo: "hover:shadow-[0_0_40px_-8px_rgba(79,70,229,0.45)]",
  healing: "hover:shadow-[0_0_40px_-8px_rgba(132,204,22,0.4)]",
  amber: "hover:shadow-[0_0_40px_-8px_rgba(251,191,36,0.4)]",
  none: "",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong = false, glow = "indigo", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 transition-shadow duration-500",
          strong ? "glass-strong" : "glass",
          glowClasses[glow],
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
