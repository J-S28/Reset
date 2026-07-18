import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  glow = "indigo",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  glow?: "indigo" | "healing" | "amber" | "none";
}) {
  return (
    <GlassCard glow={glow} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-foreground-muted">
        <Icon size={16} aria-hidden="true" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display text-2xl">{value}</p>
      {hint && <p className="text-sm text-foreground-muted">{hint}</p>}
    </GlassCard>
  );
}
