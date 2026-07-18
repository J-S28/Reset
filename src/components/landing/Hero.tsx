"use client";

import { motion } from "framer-motion";
import { ResetLogo } from "@/components/ResetLogo";
import { Button } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ParticleField } from "@/components/ui/ParticleField";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden pb-28 pt-20 sm:pt-28">
      <AuroraBackground />
      <ParticleField count={16} />
      <Container className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <ResetLogo size={120} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="font-display mt-8 text-5xl font-medium tracking-tight sm:text-7xl"
        >
          RESET
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="font-display text-gradient mt-3 max-w-xl text-xl sm:text-2xl"
        >
          Every reset begins with one conscious choice.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-5 max-w-xl text-balance text-foreground-muted"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: "easeOut" }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button href="/onboarding" size="lg">
            {t("hero.cta.primary")}
          </Button>
          <Button href="#story" variant="secondary" size="lg">
            {t("hero.cta.secondary")}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
