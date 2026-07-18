import type { ReactNode } from "react";
import dynamic from "next/dynamic";

// Both widgets are floating, click-to-open UI that isn't needed for first
// paint — deferring them off the initial client bundle shrinks the JS every
// (app) route has to ship and parse before it's interactive.
const CoachWidget = dynamic(() => import("@/components/CoachWidget").then((m) => m.CoachWidget), {
  ssr: false,
});
const EmergencyReset = dynamic(
  () => import("@/components/EmergencyReset").then((m) => m.EmergencyReset),
  { ssr: false },
);

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CoachWidget />
      <EmergencyReset />
    </>
  );
}
