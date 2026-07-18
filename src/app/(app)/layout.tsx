import type { ReactNode } from "react";
import { EmergencyReset } from "@/components/EmergencyReset";
import { CoachWidget } from "@/components/CoachWidget";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CoachWidget />
      <EmergencyReset />
    </>
  );
}
