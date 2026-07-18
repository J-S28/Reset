"use client";

import { useCallback, useState } from "react";
import type { ChatMessage, ChatMode } from "@/lib/validation";

interface UseChatOptions {
  mode: ChatMode;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function useChat({ mode, initialMessages = [], onMessagesChange }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const next: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
      setMessages(next);
      onMessagesChange?.(next);
      setIsSending(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, mode }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "RESET couldn't respond just now.");
        }

        const data = await res.json();
        const withReply: ChatMessage[] = [...next, { role: "model", text: data.reply }];
        setMessages(withReply);
        onMessagesChange?.(withReply);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending, mode, onMessagesChange],
  );

  return { messages, send, isSending, error, setMessages };
}
