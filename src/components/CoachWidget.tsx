"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChatBubble, TypingIndicator } from "@/components/chat/ChatBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useChat } from "@/hooks/useChat";
import { resetStore } from "@/lib/store";

/**
 * The persistent RESET Coach: a floating companion that remembers prior
 * check-ins (via localStorage) and never tells the user to "just stop."
 */
export function CoachWidget() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, send, isSending, error, setMessages } = useChat({
    mode: "coach",
    onMessagesChange: resetStore.setCoachMessages,
  });

  useEffect(() => {
    setMessages(resetStore.getCoachMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="focus-ring glass-strong fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-indigo-soft shadow-2xl"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? "Close RESET Coach" : "Open RESET Coach"}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className="fixed bottom-24 left-6 z-50 w-[min(92vw,380px)]"
          >
            <GlassCard strong className="flex h-[480px] flex-col p-4">
              <div className="flex items-center gap-2 pb-3">
                <Sparkles size={16} className="text-indigo-soft" aria-hidden="true" />
                <h2 id={titleId} className="text-sm font-medium">
                  RESET Coach
                </h2>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.length === 0 && (
                  <p className="text-sm text-foreground-muted">
                    What happened today?
                  </p>
                )}
                {messages.map((m, i) => (
                  <ChatBubble key={i} message={m} />
                ))}
                {isSending && <TypingIndicator />}
              </div>

              {error && (
                <p role="alert" className="pt-2 text-xs text-amber">
                  {error}
                </p>
              )}

              <div className="pt-3">
                <ChatComposer onSend={send} disabled={isSending} label="Message RESET Coach" />
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
