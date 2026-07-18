"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export const LOCALES = ["en", "es", "hi", "fr", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  fr: "Français",
  pt: "Português",
};

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    "nav.howItWorks": "How it works",
    "nav.start": "Start Your Reset",
    "hero.title1": "Reset your habits.",
    "hero.title2": "Reclaim your life.",
    "hero.subtitle": "Your habits don't define you. Your next choice does.",
    "hero.cta.primary": "Start Your Reset",
    "hero.cta.secondary": "Learn More",
    "story.title": "A quiet, honest path forward",
    "story.current": "Current You",
    "story.awareness": "Awareness",
    "story.choices": "Small Choices",
    "story.consistency": "Consistency",
    "story.transformation": "Transformation",
    "dashboard.title": "Your quiet progress",
    "dashboard.subtitle": "No streaks to fear breaking. Just where you are, gently.",
  },
  es: {
    "nav.howItWorks": "Cómo funciona",
    "nav.start": "Comienza tu Reset",
    "hero.title1": "Reinicia tus hábitos.",
    "hero.title2": "Recupera tu vida.",
    "hero.subtitle": "Tus hábitos no te definen. Tu próxima elección sí.",
    "hero.cta.primary": "Comienza tu Reset",
    "hero.cta.secondary": "Saber más",
    "story.title": "Un camino tranquilo y honesto",
    "story.current": "Tú, hoy",
    "story.awareness": "Conciencia",
    "story.choices": "Pequeñas decisiones",
    "story.consistency": "Constancia",
    "story.transformation": "Transformación",
    "dashboard.title": "Tu progreso, en calma",
    "dashboard.subtitle": "Sin rachas que temer romper. Solo dónde estás, con calma.",
  },
  hi: {
    "nav.howItWorks": "यह कैसे काम करता है",
    "nav.start": "अपना रीसेट शुरू करें",
    "hero.title1": "अपनी आदतें रीसेट करें।",
    "hero.title2": "अपनी ज़िंदगी वापस पाएं।",
    "hero.subtitle": "आपकी आदतें आपको परिभाषित नहीं करतीं। आपका अगला चुनाव करता है।",
    "hero.cta.primary": "अपना रीसेट शुरू करें",
    "hero.cta.secondary": "और जानें",
    "story.title": "आगे का एक शांत, ईमानदार रास्ता",
    "story.current": "आज के आप",
    "story.awareness": "जागरूकता",
    "story.choices": "छोटे चुनाव",
    "story.consistency": "निरंतरता",
    "story.transformation": "परिवर्तन",
    "dashboard.title": "आपकी शांत प्रगति",
    "dashboard.subtitle": "टूटने से डरने वाली कोई लकीर नहीं। बस आप कहाँ हैं, धीरे से।",
  },
  fr: {
    "nav.howItWorks": "Comment ça marche",
    "nav.start": "Commencez votre Reset",
    "hero.title1": "Réinitialisez vos habitudes.",
    "hero.title2": "Reprenez votre vie.",
    "hero.subtitle": "Vos habitudes ne vous définissent pas. Votre prochain choix, si.",
    "hero.cta.primary": "Commencez votre Reset",
    "hero.cta.secondary": "En savoir plus",
    "story.title": "Un chemin calme et honnête",
    "story.current": "Vous, aujourd'hui",
    "story.awareness": "Conscience",
    "story.choices": "Petits choix",
    "story.consistency": "Constance",
    "story.transformation": "Transformation",
    "dashboard.title": "Vos progrès, en douceur",
    "dashboard.subtitle": "Aucune série à craindre de briser. Juste où vous en êtes, doucement.",
  },
  pt: {
    "nav.howItWorks": "Como funciona",
    "nav.start": "Comece seu Reset",
    "hero.title1": "Redefina seus hábitos.",
    "hero.title2": "Recupere sua vida.",
    "hero.subtitle": "Seus hábitos não te definem. Sua próxima escolha, sim.",
    "hero.cta.primary": "Comece seu Reset",
    "hero.cta.secondary": "Saiba mais",
    "story.title": "Um caminho calmo e honesto",
    "story.current": "Você, hoje",
    "story.awareness": "Consciência",
    "story.choices": "Pequenas escolhas",
    "story.consistency": "Consistência",
    "story.transformation": "Transformação",
    "dashboard.title": "Seu progresso, em silêncio",
    "dashboard.subtitle": "Nenhuma sequência para temer quebrar. Só onde você está, com calma.",
  },
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "reset.locale";

// Module-level locale store (mirrors the resetStore pattern): keeps a stable
// snapshot for useSyncExternalStore instead of hydrating via a setState
// effect, and lets any component change the language without prop drilling.
let currentLocale: Locale = "en";
let localeHydrated = false;
const localeListeners = new Set<() => void>();

function detectInitialLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && LOCALES.includes(stored)) return stored;
  const browserLang = window.navigator.language.slice(0, 2) as Locale;
  return LOCALES.includes(browserLang) ? browserLang : "en";
}

function ensureLocaleHydrated() {
  if (localeHydrated || typeof window === "undefined") return;
  localeHydrated = true;
  currentLocale = detectInitialLocale();
}

function subscribeLocale(listener: () => void) {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

function getLocaleSnapshot(): Locale {
  ensureLocaleHydrated();
  return currentLocale;
}

function getLocaleServerSnapshot(): Locale {
  return "en";
}

function setGlobalLocale(next: Locale) {
  currentLocale = next;
  window.localStorage.setItem(STORAGE_KEY, next);
  localeListeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setGlobalLocale(next), []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }
  return ctx;
}
