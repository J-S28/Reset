"use client";

import Link from "next/link";
import { ResetLogo } from "@/components/ResetLogo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

export function Nav() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-full">
          <ResetLogo size={32} animate={false} />
          <span className="font-display text-lg tracking-tight">RESET</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <a
            href="#story"
            className="focus-ring rounded-full text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            {t("nav.howItWorks")}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:block" />
          <Button href="/onboarding" size="md" className="!px-5 !py-2 text-sm">
            {t("nav.start")}
          </Button>
        </div>
      </div>
    </header>
  );
}
