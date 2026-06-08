"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Lang } from "@/data/i18n";
import { copy } from "@/data/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof copy.cn;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("cn");

  useEffect(() => {
    const saved = window.localStorage.getItem("xinlight-lang");

    if (saved === "cn" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((nextLang: Lang) => {
    setLangState(nextLang);
    window.localStorage.setItem("xinlight-lang", nextLang);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: copy[lang],
    }),
    [lang, setLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}