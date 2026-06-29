"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const entryCopies = {
  cn: {
    eyebrow: "欢迎光临～",
    title: "Stella Planet",
    login: "登录",
  },
  en: {
    eyebrow: "♥Welcome to♥",
    title: "Stella Planet",
    login: "Log in",
  },
};

export default function EntryPage() {
  const { lang, setLang } = useLanguage();
  const page = entryCopies[lang];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <video
          className="block h-full w-full object-cover md:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src="/backgrounds/entry/entry-background-mobile.mp4"
            type="video/mp4"
          />
        </video>

        <video
          className="hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src="/backgrounds/entry/entry-background-desktop.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-slate-950/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/15 to-slate-950/70" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />
      </div>

      <div className="relative z-20 mx-auto flex max-w-5xl justify-end">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLang("cn")}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              lang === "cn" ? "bg-white text-slate-950" : "text-slate-300",
            ].join(" ")}
          >
            CN
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              lang === "en" ? "bg-white text-slate-950" : "text-slate-300",
            ].join(" ")}
          >
            EN
          </button>
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl -translate-y-10 text-center md:-translate-y-16">
          <p className="text-sm uppercase tracking-[0.34em] text-sky-200">
            {page.eyebrow}
          </p>

          <h1 className="mt-5 text-4xl font-semibold italic tracking-tight text-white md:text-6xl">
            {page.title}
          </h1>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-sky-200/90 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              {page.login}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}