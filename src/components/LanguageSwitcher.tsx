"use client";

import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, useLanguage, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <label className={className}>
      <span className="sr-only">Choose language</span>
      <span className="focus-within:ring-2 focus-within:ring-indigo-soft glass flex items-center gap-2 rounded-full px-3 py-2 text-sm">
        <Globe size={16} className="text-foreground-muted" aria-hidden="true" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="focus-ring cursor-pointer appearance-none bg-transparent text-foreground outline-none"
          aria-label="Select language"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l} className="bg-midnight text-foreground">
              {LOCALE_LABELS[l]}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
