import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/validation";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-indigo to-indigo-soft text-white"
            : "glass text-foreground",
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="RESET is typing">
      <div className="glass flex items-center gap-1.5 rounded-2xl px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-muted"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
