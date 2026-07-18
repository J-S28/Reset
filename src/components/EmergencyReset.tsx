"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, MessageCircle, Wind, BookOpen, Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ParticleField } from "@/components/ui/ParticleField";
import type { ChatMessage } from "@/lib/validation";

const OPTIONS = [
  { key: "breathe", label: "Breathe together", icon: Wind },
  { key: "talk", label: "Talk to RESET", icon: MessageCircle },
  { key: "journal", label: "Reflect for a moment", icon: BookOpen },
  { key: "spark", label: "A quick, better thought", icon: Sparkles },
] as const;

export function EmergencyReset() {
  const [open, setOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const requestSupport = useCallback(async () => {
    setSupportMessage(null);
    setLoading(true);
    try {
      const messages: ChatMessage[] = [
        { role: "user", text: "I need help — I'm about to give in to the urge to scroll." },
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, mode: "emergency" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSupportMessage(data.reply);
      } else {
        setSupportMessage("You're not failing. You're simply facing a difficult moment. Let's get through the next sixty seconds together.");
      }
    } catch {
      setSupportMessage("You're not failing. You're simply facing a difficult moment. Let's get through the next sixty seconds together.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetching data in response to a dependency change (dialog opening) is a
  // canonical Effect use case; requestSupport's synchronous state reset
  // before its first `await` is what the linter's static analysis is
  // catching, not an actual anti-pattern here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      requestSupport();
      dialogRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, requestSupport]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="focus-ring glass-strong fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium text-foreground shadow-2xl"
        aria-haspopup="dialog"
      >
        <HeartHandshake size={18} className="text-healing-soft" aria-hidden="true" />
        I Need Help
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-midnight-deep/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <ParticleField count={10} slow className="opacity-60" />
            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-md"
            >
              <GlassCard strong className="relative text-center">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="focus-ring absolute right-4 top-4 rounded-full p-1 text-foreground-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <span className="animate-breathe absolute h-20 w-20 rounded-full bg-healing/25 blur-xl" aria-hidden="true" />
                  <span className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-soft to-healing-soft" />
                </div>

                <h2 id={titleId} className="font-display text-2xl">
                  You don&apos;t have to win today.
                </h2>
                <p className="mt-1 text-foreground-muted">You only need one better choice.</p>

                <p className="mt-5 min-h-12 text-balance text-sm text-foreground" aria-live="polite">
                  {loading ? "RESET is here with you…" : supportMessage}
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {OPTIONS.map(({ key, label, icon: Icon }) => (
                    <Button key={key} variant="secondary" size="md" className="flex-col !py-4 text-xs">
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </Button>
                  ))}
                </div>

                <Button variant="ghost" size="md" className="mt-4" onClick={() => setOpen(false)}>
                  Continue focusing
                </Button>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
