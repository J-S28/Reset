"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n";

const STEP_KEYS = [
  "story.current",
  "story.awareness",
  "story.choices",
  "story.consistency",
  "story.transformation",
] as const;

const STEP_COLORS = ["#94a3b8", "#818cf8", "#4f46e5", "#84cc16", "#fbbf24"];

export function ScrollStory() {
  const { t } = useLanguage();

  return (
    <section id="story" className="relative py-28">
      <Container className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl sm:text-4xl"
        >
          {t("story.title")}
        </motion.h2>

        <ol className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-2">
          {STEP_KEYS.map((key, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold text-midnight-deep"
                style={{ backgroundColor: STEP_COLORS[i] }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="text-sm text-foreground-muted sm:text-base">{t(key)}</span>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
