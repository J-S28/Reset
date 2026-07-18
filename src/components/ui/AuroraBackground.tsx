"use client";

import { cn } from "@/lib/cn";

/**
 * Shared ambient backdrop: mesh gradient + soft drifting blobs. Used behind
 * the landing hero, processing screen, and emergency reset overlay so the
 * whole app breathes with one consistent visual language.
 */
export function AuroraBackground({
  className,
  calm = false,
}: {
  className?: string;
  calm?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 mesh-gradient" />
      <div
        className={cn(
          "absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo/30 blur-3xl",
          !calm && "animate-drift",
        )}
      />
      <div
        className={cn(
          "absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-healing/20 blur-3xl",
          !calm && "animate-drift",
        )}
        style={{ animationDelay: "-4s" }}
      />
      <div
        className={cn(
          "absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber/10 blur-3xl",
          !calm && "animate-drift",
        )}
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
