"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Download, Mail, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { resetStore } from "@/lib/store";
import type { FutureLetter } from "@/lib/validation";

export default function LetterPage() {
  const router = useRouter();
  const [letter, setLetter] = useState<FutureLetter | null>(null);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generate = useCallback(async () => {
    const messages = resetStore.getOnboardingMessages();
    if (messages.filter((m) => m.role === "user").length === 0) {
      router.replace("/onboarding");
      return;
    }
    setLoading(true);
    setError(null);
    setOpened(false);
    try {
      const res = await fetch("/api/future-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, monthsAhead: 6 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "RESET couldn't write your letter yet.");
      }
      const data = await res.json();
      setLetter(data.letter as FutureLetter);
      resetStore.setLetter(data.letter as FutureLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // On mount: show a saved letter immediately, or kick off generation — a
  // genuine branch into a network side effect, not a pure store mirror, so
  // this stays a plain effect rather than useSyncExternalStore.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = resetStore.getLetter();
    if (stored) {
      setLetter(stored);
    } else {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const fullText = letter ? `${letter.salutation}\n\n${letter.body}\n\n${letter.signoff}` : "";

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const download = () => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "letter-from-future-you.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <AuroraBackground calm className="opacity-60" />
      <Container className="relative flex flex-1 flex-col items-center pt-10">
        <div className="w-full">
          <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm text-foreground-muted hover:text-foreground">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>

        <header className="mt-6 text-center">
          <p className="text-xs uppercase tracking-widest text-foreground-muted">Module: Your keepsake</p>
          <h1 className="font-display mt-2 text-3xl sm:text-4xl">A Letter From Your Future Self</h1>
        </header>

        <div className="mt-12 flex w-full flex-1 items-center justify-center">
          {loading && !letter && (
            <p className="text-foreground-muted" aria-live="polite">
              Your future self is finding the words…
            </p>
          )}

          {error && !letter && (
            <div className="text-center" role="alert">
              <p className="text-amber">{error}</p>
              <Button size="md" className="mt-4" onClick={generate}>
                Try again
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {letter && !opened && (
              <motion.button
                key="envelope"
                type="button"
                onClick={() => setOpened(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, rotateX: 20 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="focus-ring group relative flex aspect-[4/3] w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border border-amber/20 bg-gradient-to-br from-[#1c2440] to-[#111827] p-8 text-center shadow-2xl"
                aria-label="Open your letter from your future self"
              >
                <span className="animate-breathe absolute inset-0 rounded-3xl bg-amber/5" aria-hidden="true" />
                <Mail size={40} className="relative text-amber transition-transform group-hover:scale-105" aria-hidden="true" />
                <p className="relative font-display text-lg">A letter is waiting for you</p>
                <p className="relative text-sm text-foreground-muted">Tap the envelope to open it</p>
              </motion.button>
            )}

            {letter && opened && (
              <motion.article
                key="letter"
                initial={{ opacity: 0, y: 16, rotateX: -8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-xl"
              >
                <GlassCard strong glow="amber" className="relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, #f8fafc 0px, transparent 1px, transparent 28px)",
                    }}
                  />
                  <p className="font-display relative text-lg text-amber">{letter.salutation}</p>
                  <div className="relative mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                    {letter.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <p className="font-display relative mt-6 text-right text-amber">{letter.signoff}</p>
                </GlassCard>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button variant="secondary" size="md" onClick={toggleSpeech} className="gap-2">
                    {speaking ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
                    {speaking ? "Stop reading" : "Read aloud"}
                  </Button>
                  <Button variant="secondary" size="md" onClick={download} className="gap-2">
                    <Download size={16} aria-hidden="true" />
                    Save as keepsake
                  </Button>
                  <Button variant="secondary" size="md" onClick={generate} disabled={loading} className="gap-2">
                    <RefreshCw size={16} aria-hidden="true" />
                    Regenerate after a milestone
                  </Button>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}
