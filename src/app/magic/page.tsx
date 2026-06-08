"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const puzzleCopies = {
  cn: {
    puzzles: [
      {
        id: 1,
        title: "星光盒子 001",
        publishAt: "2026-02-14 20:00",
        reward: "+50 星光值",
      },
      {
        id: 2,
        title: "云层后的暗号",
        publishAt: "2026-02-21 20:00",
        reward: "+50 星光值",
      },
      {
        id: 3,
        title: "月亮写下的线索",
        publishAt: "2026-03-01 20:00",
        reward: "+50 星光值",
      },
    ],
  },
  en: {
    puzzles: [
      {
        id: 1,
        title: "Starlight Box 001",
        publishAt: "2026-02-14 20:00",
        reward: "+50 starlight value",
      },
      {
        id: 2,
        title: "The Code Behind the Clouds",
        publishAt: "2026-02-21 20:00",
        reward: "+50 starlight value",
      },
      {
        id: 3,
        title: "The Clue Written by the Moon",
        publishAt: "2026-03-01 20:00",
        reward: "+50 starlight value",
      },
    ],
  },
};

export default function MagicPage() {
  const { lang, t } = useLanguage();
  const page = puzzleCopies[lang];

  return (
    <PageShell
      title={t.magic.title}
      intro={t.magic.intro}
      loadingTitle={t.magic.loadingTitle}
      loadingSubtitle={t.magic.loadingSubtitle}
      loadingVariant="magic"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {page.puzzles.map((puzzle) => (
          <article
            key={puzzle.id}
            className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
          >
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-violet-300/20 text-3xl">
              ✦
            </div>

            <h2 className="text-2xl font-semibold">{puzzle.title}</h2>

            <p className="mt-4 text-sm text-slate-300">
              {t.magic.availableAt}: {puzzle.publishAt}
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {t.magic.reward}: {puzzle.reward}
            </p>

            <p className="mt-2 text-sm text-amber-200">{t.magic.unsolved}</p>

            <button
              type="button"
              className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
            >
              {t.magic.openBox}
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}