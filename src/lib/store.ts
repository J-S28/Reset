"use client";

import { useSyncExternalStore } from "react";
import type { ChatMessage, FutureLetter, Insights } from "./validation";

const KEYS = {
  onboarding: "reset.onboarding.messages",
  coach: "reset.coach.messages",
  insights: "reset.insights",
  letter: "reset.letter",
} as const;

interface StoreState {
  onboarding: ChatMessage[];
  coach: ChatMessage[];
  insights: Insights | null;
  letter: FutureLetter | null;
}

const DEFAULT_STATE: StoreState = {
  onboarding: [],
  coach: [],
  insights: null,
  letter: null,
};

// A small in-memory mirror of localStorage. Reads/writes go through this
// object so useSyncExternalStore gets a stable snapshot reference instead of
// re-parsing JSON (and returning a new object identity) on every call, which
// would otherwise thrash React's re-render check.
let state: StoreState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = {
    onboarding: readJson(KEYS.onboarding, DEFAULT_STATE.onboarding),
    coach: readJson(KEYS.coach, DEFAULT_STATE.coach),
    insights: readJson(KEYS.insights, DEFAULT_STATE.insights),
    letter: readJson(KEYS.letter, DEFAULT_STATE.letter),
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSlice<K extends keyof StoreState>(slice: K, value: StoreState[K], storageKey: string) {
  ensureHydrated();
  state = { ...state, [slice]: value };
  window.localStorage.setItem(storageKey, JSON.stringify(value));
  emit();
}

function getSnapshot(): StoreState {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): StoreState {
  return DEFAULT_STATE;
}

/** Subscribes the component to every slice of RESET's local state. */
export function useResetStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const resetStore = {
  getOnboardingMessages: () => getSnapshot().onboarding,
  setOnboardingMessages: (messages: ChatMessage[]) => setSlice("onboarding", messages, KEYS.onboarding),

  getCoachMessages: () => getSnapshot().coach,
  setCoachMessages: (messages: ChatMessage[]) => setSlice("coach", messages, KEYS.coach),

  getInsights: () => getSnapshot().insights,
  setInsights: (insights: Insights) => setSlice("insights", insights, KEYS.insights),

  getLetter: () => getSnapshot().letter,
  setLetter: (letter: FutureLetter) => setSlice("letter", letter, KEYS.letter),

  clearAll: () => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    state = DEFAULT_STATE;
    emit();
  },
};
