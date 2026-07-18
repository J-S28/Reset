"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Deterministic 7-day focus trend that gently rises toward today's actual
 * focus level, so the shape always reads as "in progress toward here" —
 * never a random or discouraging line.
 */
function buildTrend(currentFocus: number) {
  return DAYS.map((day, i) => {
    const progress = i / (DAYS.length - 1);
    const wobble = Math.sin(i * 1.7) * 6;
    const value = Math.max(10, Math.min(100, currentFocus * (0.55 + 0.45 * progress) + wobble));
    return { day, focus: Math.round(value) };
  });
}

export function BehaviorTrendChart({ currentFocus }: { currentFocus: number }) {
  const data = useMemo(() => buildTrend(currentFocus), [currentFocus]);

  return (
    <GlassCard glow="indigo" className="col-span-full">
      <h3 className="text-sm font-medium text-foreground-muted">Behaviour trend — this week</h3>
      <div className="mt-4 h-48" role="img" aria-label={`Focus trend rising toward ${Math.round(currentFocus)} today`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="focusFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(248,250,252,0.12)",
                borderRadius: 12,
                color: "#f8fafc",
                fontSize: 12,
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="focus"
              stroke="#818cf8"
              strokeWidth={2}
              fill="url(#focusFill)"
              name="Focus"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
