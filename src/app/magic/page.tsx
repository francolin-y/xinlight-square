"use client";

import { useState } from "react";
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
        clue: "第一枚星光钥匙，藏在你们第一次认真说晚安的那一天。",
        content: "这里之后可以放谜题正文、图片、暗号、输入框，或者通往下一页的按钮。",
      },
      {
        id: 2,
        title: "云层后的暗号",
        publishAt: "2026-02-21 20:00",
        reward: "+50 星光值",
        clue: "云层不会遮住答案，只会让答案变得更像一个秘密。",
        content: "这里可以放第二个谜题的内容。之后接后台时，这些内容可以从数据库读取。",
      },
      {
        id: 3,
        title: "月亮写下的线索",
        publishAt: "2026-03-01 20:00",
        reward: "+50 星光值",
        clue: "月亮没有说出口的部分，通常写在光的边缘。",
        content: "这里可以放第三个谜题的内容。",
      },
    ],
    opened: "已展开",
    locked: "尚未解锁",
  },
  en: {
    puzzles: [
      {
        id: 1,
        title: "Starlight Box 001",
        publishAt: "2026-02-14 20:00",
        reward: "+50 starlight value",
        clue: "The first starlight key is hidden on the day you first truly said good night.",
        content: "This area can later hold the puzzle body, images, codes, input fields, or a button to the next step.",
      },
      {
        id: 2,
        title: "The Code Behind the Clouds",
        publishAt: "2026-02-21 20:00",
        reward: "+50 starlight value",
        clue: "Clouds do not hide the answer. They only make it feel more like a secret.",
        content: "This can hold the second puzzle content. Later, it can be loaded from your backend.",
      },
      {
        id: 3,
        title: "The Clue Written by the Moon",
        publishAt: "2026-03-01 20:00",
        reward: "+50 starlight value",
        clue: "The part the moon did not say aloud is usually written along the edge of light.",
        content: "This can hold the third puzzle content.",
      },
    ],
    opened: "Opened",
    locked: "Locked",
  },
};

function isPuzzleAvailable(publishAt: string) {
  return new Date(publishAt.replace(" ", "T")).getTime() <= Date.now();
}

export default function MagicPage() {
  const { lang, t } = useLanguage();
  const page = puzzleCopies[lang];
  const [openedPuzzleId, setOpenedPuzzleId] = useState<number | null>(null);

  function togglePuzzle(puzzleId: number, isAvailable: boolean) {
    if (!isAvailable) return;

    setOpenedPuzzleId((current) => (current === puzzleId ? null : puzzleId));
  }

  return (
    <PageShell
      title={t.magic.title}
      intro={t.magic.intro}
      loadingTitle={t.magic.loadingTitle}
      loadingSubtitle={t.magic.loadingSubtitle}
      loadingVariant="magic"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {page.puzzles.map((puzzle) => {
          const isAvailable = isPuzzleAvailable(puzzle.publishAt);
          const isLocked = !isAvailable;
          const isOpened = openedPuzzleId === puzzle.id && isAvailable;

          return (
            <article
              key={puzzle.id}
              className={[
                "group relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl backdrop-blur-md transition duration-300",
                isLocked
                  ? "border-white/5 bg-white/5 opacity-75"
                  : isOpened
                    ? "border-violet-200/50 bg-violet-200/20 shadow-violet-950/30"
                    : "border-white/10 bg-white/10 hover:-translate-y-1 hover:bg-white/15",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />
                <div className="absolute -bottom-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl" />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => togglePuzzle(puzzle.id, isAvailable)}
                  aria-expanded={isOpened}
                  disabled={isLocked}
                  className={[
                    "mb-6 grid h-20 w-20 place-items-center rounded-3xl text-4xl shadow-lg ring-1 transition duration-300 disabled:cursor-not-allowed",
                    isLocked
                      ? "bg-slate-900/50 text-white/40 ring-white/10"
                      : isOpened
                        ? "rotate-3 bg-white text-violet-700 ring-white/50 shadow-white/20"
                        : "bg-violet-300/20 text-white ring-white/20 group-hover:scale-105 group-hover:bg-violet-200/30",
                  ].join(" ")}
                >
                  {isLocked ? "🔒" : isOpened ? "✷" : "✦"}
                </button>

                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold">{puzzle.title}</h2>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs ring-1",
                      isLocked
                        ? "bg-white/10 text-white/50 ring-white/10"
                        : isOpened
                          ? "bg-white/20 text-violet-50 ring-white/20"
                          : "bg-amber-200/10 text-amber-100 ring-amber-200/20",
                    ].join(" ")}
                  >
                    {isLocked
                      ? page.locked
                      : isOpened
                        ? page.opened
                        : t.magic.unsolved}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-300">
                  {t.magic.availableAt}: {puzzle.publishAt}
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {t.magic.reward}: {puzzle.reward}
                </p>

                <div
                  className={[
                    "grid transition-all duration-500",
                    isOpened
                      ? "mt-6 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <div className="rounded-3xl border border-white/15 bg-slate-950/35 p-5">
                      <p className="text-sm leading-6 text-violet-100">
                        {puzzle.clue}
                      </p>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-sm leading-6 text-slate-100">
                          {puzzle.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePuzzle(puzzle.id, isAvailable)}
                  disabled={isLocked}
                  className={[
                    "mt-6 rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed",
                    isLocked
                      ? "bg-white/10 text-white/40"
                      : isOpened
                        ? "bg-violet-100 text-violet-950 hover:bg-white"
                        : "bg-white text-slate-950 hover:bg-violet-100",
                  ].join(" ")}
                >
                  {isLocked ? page.locked : isOpened ? page.opened : t.magic.openBox}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}