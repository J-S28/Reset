"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResetLogo } from "@/components/ResetLogo";
import { ChatBubble, TypingIndicator } from "@/components/chat/ChatBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useChat } from "@/hooks/useChat";
import { resetStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/validation";

const OPENING_MESSAGE: ChatMessage = {
  role: "model",
  text: "Hi. I'm Reset. I'm here to understand you — not judge you. How has today been for you?",
};

const MIN_EXCHANGES_TO_CONTINUE = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  const { messages, send, isSending, error, setMessages } = useChat({
    mode: "onboarding",
    onMessagesChange: resetStore.setOnboardingMessages,
  });

  // One-time seed of useChat's owned local state from localStorage on mount,
  // with a fallback greeting merge — not a prop/state mirror, so
  // useSyncExternalStore doesn't fit as cleanly as it does on the read-only
  // pages.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = resetStore.getOnboardingMessages();
    setMessages(stored.length > 0 ? stored : [OPENING_MESSAGE]);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canContinue = userTurns >= MIN_EXCHANGES_TO_CONTINUE;

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <AuroraBackground calm />
      <Container className="relative flex flex-1 flex-col items-center py-10">
        <div className="flex items-center gap-3">
          <ResetLogo size={40} animate={false} />
          <p className="font-display text-lg">The Reset Conversation</p>
        </div>

        <GlassCard strong className="mt-8 flex w-full max-w-2xl flex-1 flex-col p-5" glow="none">
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with RESET"
            className="flex h-[52vh] min-h-72 flex-col gap-3 overflow-y-auto pr-1"
          >
            {hydrated &&
              messages.map((m, i) => <ChatBubble key={i} message={m} />)}
            {isSending && <TypingIndicator />}
          </div>

          {error && (
            <p role="alert" className="pt-2 text-sm text-amber">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4">
            <ChatComposer onSend={send} disabled={isSending} />

            {canContinue && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button
                  size="md"
                  onClick={() => router.push("/processing")}
                  className="gap-2"
                >
                  Continue to Your Why
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}
