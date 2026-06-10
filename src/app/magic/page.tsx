"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import type { Lang } from "@/data/i18n";

type LocalizedText = {
  cn: string;
  en: string;
};

type MagicPuzzleStatus = "new" | "normal" | "solved";

type MagicPuzzle = {
  id: string;
  month: string;
  publishedAt: string;
  reward: LocalizedText;
  title: LocalizedText;
  clue: LocalizedText;
  question: LocalizedText;
  unlockedMessage: LocalizedText;
  answer: string;
  status?: MagicPuzzleStatus;
};

const ITEMS_PER_TRACK = 6;

const magicPuzzles: MagicPuzzle[] = [
  {
    id: "orb-2026-06-20",
    month: "2026-06",
    publishedAt: "2026-06-20 20:00",
    reward: {
      cn: "+80 星光值",
      en: "+80 starlight value",
    },
    title: {
      cn: "尚未醒来的水晶球",
      en: "The Sleeping Crystal Orb",
    },
    clue: {
      cn: "这颗水晶球还没有到醒来的时间。",
      en: "This orb has not reached its awakening time yet.",
    },
    question: {
      cn: "等它亮起来之后，谜题会出现在这里。",
      en: "When it begins to glow, the puzzle will appear here.",
    },
    unlockedMessage: {
      cn: "这是一段未来才会出现的留言。",
      en: "This is a message reserved for later.",
    },
    answer: "future",
  },
  {
    id: "orb-2026-06-09",
    month: "2026-06",
    publishedAt: "2026-06-09 20:00",
    reward: {
      cn: "+50 星光值",
      en: "+50 starlight value",
    },
    title: {
      cn: "今晚的星光密码",
      en: "Tonight's Starlight Code",
    },
    clue: {
      cn: "第一枚星光钥匙，藏在你们第一次认真说晚安的那一天。",
      en: "The first starlight key is hidden on the day you first truly said good night.",
    },
    question: {
      cn: "输入那个只属于你们的数字暗号。",
      en: "Enter the number code that belongs only to you two.",
    },
    unlockedMessage: {
      cn: "水晶球亮起来了。这里之后可以放照片、留言、奖励或下一段谜题。",
      en: "The orb is glowing. This area can later reveal photos, messages, rewards, or the next puzzle.",
    },
    answer: "520",
    status: "new",
  },
  {
    id: "orb-2026-06-07",
    month: "2026-06",
    publishedAt: "2026-06-07 20:00",
    reward: {
      cn: "+50 星光值",
      en: "+50 starlight value",
    },
    title: {
      cn: "云层后的暗号",
      en: "The Code Behind the Clouds",
    },
    clue: {
      cn: "云层不会遮住答案，只会让答案变得更像一个秘密。",
      en: "Clouds do not hide the answer. They only make it feel more like a secret.",
    },
    question: {
      cn: "这道谜题以后可以换成真正的文字、图片或密码题。",
      en: "This puzzle can later become a real text, image, or code challenge.",
    },
    unlockedMessage: {
      cn: "你找到了云层后的暗号。",
      en: "You found the code behind the clouds.",
    },
    answer: "cloud",
  },
  {
    id: "orb-2026-06-05",
    month: "2026-06",
    publishedAt: "2026-06-05 20:00",
    reward: {
      cn: "+50 星光值",
      en: "+50 starlight value",
    },
    title: {
      cn: "月亮写下的线索",
      en: "The Clue Written by the Moon",
    },
    clue: {
      cn: "月亮没有说出口的部分，通常写在光的边缘。",
      en: "The part the moon did not say aloud is usually written along the edge of light.",
    },
    question: {
      cn: "这里可以放第三个谜题的正文。",
      en: "This area can hold the third puzzle body.",
    },
    unlockedMessage: {
      cn: "月亮把线索交给你了。",
      en: "The moon has handed you the clue.",
    },
    answer: "moon",
  },
  {
    id: "orb-2026-06-03",
    month: "2026-06",
    publishedAt: "2026-06-03 20:00",
    reward: {
      cn: "+30 星光值",
      en: "+30 starlight value",
    },
    title: {
      cn: "星轨偏移三厘米",
      en: "The Star Track Shifted",
    },
    clue: {
      cn: "有些答案不是藏起来了，只是稍微偏了一点。",
      en: "Some answers are not hidden. They are only slightly shifted.",
    },
    question: {
      cn: "这里之后可以放选择题、短答题或图片线索。",
      en: "This can later hold a multiple choice question, short answer, or image clue.",
    },
    unlockedMessage: {
      cn: "星轨重新校准。",
      en: "The star track has been realigned.",
    },
    answer: "star",
  },
  {
    id: "orb-2026-06-01",
    month: "2026-06",
    publishedAt: "2026-06-01 20:00",
    reward: {
      cn: "+30 星光值",
      en: "+30 starlight value",
    },
    title: {
      cn: "第一段六月星轨",
      en: "The First June Star Track",
    },
    clue: {
      cn: "六月的第一颗水晶球，用来测试这个页面的星轨结构。",
      en: "The first June orb is here to test the star track structure.",
    },
    question: {
      cn: "之后这颗水晶球可以替换成真正的谜题。",
      en: "This orb can later be replaced with a real puzzle.",
    },
    unlockedMessage: {
      cn: "第一段六月星轨已点亮。",
      en: "The first June star track is lit.",
    },
    answer: "june",
  },
  {
    id: "orb-2026-06-00",
    month: "2026-06",
    publishedAt: "2026-06-01 10:00",
    reward: {
      cn: "+20 星光值",
      en: "+20 starlight value",
    },
    title: {
      cn: "第二段星轨测试",
      en: "Second Track Test",
    },
    clue: {
      cn: "这是第七颗水晶球，用来测试底部分段导航。",
      en: "This seventh orb tests the bottom track pagination.",
    },
    question: {
      cn: "如果当前月份超过 6 颗水晶球，就会出现下一段星轨。",
      en: "When a month has more than 6 orbs, the next track section appears.",
    },
    unlockedMessage: {
      cn: "分段星轨测试成功。",
      en: "Track pagination test completed.",
    },
    answer: "7",
  },
  {
    id: "orb-2026-05-20",
    month: "2026-05",
    publishedAt: "2026-05-20 20:00",
    reward: {
      cn: "+52 星光值",
      en: "+52 starlight value",
    },
    title: {
      cn: "五月的秘密水晶",
      en: "May's Secret Crystal",
    },
    clue: {
      cn: "五月适合放纪念日、照片解锁或特别留言。",
      en: "May is suitable for anniversaries, photo unlocks, or special messages.",
    },
    question: {
      cn: "这里是五月星轨里的第一颗水晶球。",
      en: "This is the first orb in the May star track.",
    },
    unlockedMessage: {
      cn: "五月的秘密已经打开。",
      en: "May's secret has opened.",
    },
    answer: "may",
  },
];

const pageCopies = {
  cn: {
    title: "魔法空间",
    intro: "选择一段星历，让水晶球沿着星轨醒来。每颗水晶球都可以藏一段谜题、留言或奖励。",
    chooseArchive: "选择星历",
    trackLabel: "星轨",
    trackSection: "段星轨",
    prevTrack: "上一段星轨",
    nextTrack: "下一段星轨",
    goToTrack: "前往第",
    calibrate: "校准",
    statusNew: "新水晶",
    statusNormal: "可解锁",
    statusLocked: "尚未上线",
    statusSolved: "已解开",
    openOrb: "查看水晶球",
    availableAt: "上线时间",
    reward: "奖励",
    clue: "线索",
    question: "题目",
    answer: "答案",
    answerPlaceholder: "输入你的答案",
    submitAnswer: "提交答案",
    correct: "答对了",
    wrong: "答案不对，再想想",
    close: "关闭",
    unlocked: "解锁内容",
    empty: "这段星历还没有水晶球。",
  },
  en: {
    title: "Magic Room",
    intro: "Choose a star archive and let the crystal orbs awaken along the track. Each orb can hold a puzzle, message, or reward.",
    chooseArchive: "Choose archive",
    trackLabel: "Star track",
    trackSection: "track section",
    prevTrack: "Previous track",
    nextTrack: "Next track",
    goToTrack: "Go to track",
    calibrate: "Calibrate",
    statusNew: "New orb",
    statusNormal: "Available",
    statusLocked: "Not available yet",
    statusSolved: "Solved",
    openOrb: "View crystal orb",
    availableAt: "Available at",
    reward: "Reward",
    clue: "Clue",
    question: "Question",
    answer: "Answer",
    answerPlaceholder: "Enter your answer",
    submitAnswer: "Submit answer",
    correct: "Correct",
    wrong: "Not quite. Try again.",
    close: "Close",
    unlocked: "Unlocked content",
    empty: "No crystal orbs in this archive yet.",
  },
};

function getText(text: LocalizedText, lang: Lang) {
  return text[lang];
}

function isPuzzleAvailable(publishedAt: string) {
  return new Date(publishedAt.replace(" ", "T")).getTime() <= Date.now();
}

function formatDate(publishedAt: string, lang: Lang) {
  const [date, time] = publishedAt.split(" ");
  const [year, month, day] = date.split("-");

  if (lang === "cn") {
    return `${year}.${month}.${day} ${time}`;
  }

  return `${month}/${day}/${year} ${time}`;
}

function getMonthLabel(monthValue: string, lang: Lang) {
  const [year, month] = monthValue.split("-");
  const monthNumber = Number(month);

  const englishMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (lang === "cn") {
    return `${year} 年 ${monthNumber} 月的星轨`;
  }

  return `${englishMonths[monthNumber - 1]} ${year} · Star Track`;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

export default function MagicPage() {
  const { lang, t } = useLanguage();
  const page = pageCopies[lang];

  const monthOptions = useMemo(() => {
    return Array.from(new Set(magicPuzzles.map((puzzle) => puzzle.month))).sort(
      (a, b) => b.localeCompare(a)
    );
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0] ?? "");
  const [currentTrack, setCurrentTrack] = useState(1);
  const [jumpTrack, setJumpTrack] = useState("1");
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(
    null
  );
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<string[]>([]);

  const selectedPuzzle =
    magicPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId) ?? null;

  const filteredPuzzles = useMemo(() => {
    return magicPuzzles
      .filter((puzzle) => puzzle.month === selectedMonth)
      .sort(
        (a, b) =>
          new Date(b.publishedAt.replace(" ", "T")).getTime() -
          new Date(a.publishedAt.replace(" ", "T")).getTime()
      );
  }, [selectedMonth]);

  const totalTracks = Math.max(
    1,
    Math.ceil(filteredPuzzles.length / ITEMS_PER_TRACK)
  );

  const visiblePuzzles = filteredPuzzles.slice(
    (currentTrack - 1) * ITEMS_PER_TRACK,
    currentTrack * ITEMS_PER_TRACK
  );

  useEffect(() => {
    setCurrentTrack(1);
    setJumpTrack("1");
    setSelectedPuzzleId(null);
  }, [selectedMonth]);

  useEffect(() => {
    if (currentTrack > totalTracks) {
      setCurrentTrack(totalTracks);
      setJumpTrack(String(totalTracks));
    }
  }, [currentTrack, totalTracks]);

  function openPuzzle(puzzle: MagicPuzzle) {
    if (!isPuzzleAvailable(puzzle.publishedAt)) return;

    setSelectedPuzzleId(puzzle.id);
    setAnswerInput("");
    setAnswerResult(null);
  }

  function closePuzzle() {
    setSelectedPuzzleId(null);
    setAnswerInput("");
    setAnswerResult(null);
  }

  function submitAnswer() {
    if (!selectedPuzzle) return;

    const isCorrect =
      normalizeAnswer(answerInput) === normalizeAnswer(selectedPuzzle.answer);

    if (isCorrect) {
      setAnswerResult("correct");
      setSolvedPuzzleIds((current) =>
        current.includes(selectedPuzzle.id)
          ? current
          : [...current, selectedPuzzle.id]
      );
    } else {
      setAnswerResult("wrong");
    }
  }

  function handleJumpTrack() {
    const parsed = Number(jumpTrack);

    if (!Number.isInteger(parsed)) return;

    const nextTrack = Math.min(Math.max(parsed, 1), totalTracks);
    setCurrentTrack(nextTrack);
    setJumpTrack(String(nextTrack));
  }

  return (
    <PageShell
      title={page.title}
      intro={page.intro}
      loadingTitle={t.magic.loadingTitle}
      loadingSubtitle={t.magic.loadingSubtitle}
      loadingVariant="magic"
      backgroundVariant="magic"
      fontVariant="magic"
    >
      <div className="magic-space">
        <div className="magic-space-panel">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-violet-100/70">
              {page.chooseArchive}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              {getMonthLabel(selectedMonth, lang)}
            </h2>
          </div>

          <label className="grid gap-2 text-sm text-violet-100">
            <span>{page.chooseArchive}</span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-full border border-white/15 bg-slate-950/60 px-5 py-3 text-white outline-none ring-0 transition hover:bg-slate-900/80 focus:border-violet-200/60"
            >
              {monthOptions.map((monthValue) => (
                <option key={monthValue} value={monthValue}>
                  {getMonthLabel(monthValue, lang)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="magic-track-panel" aria-label={page.trackLabel}>
          <div className="magic-track-line" />

          {visiblePuzzles.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center text-slate-200">
              {page.empty}
            </div>
          ) : (
            <div className="relative z-10 grid gap-10 py-4">
              {visiblePuzzles.map((puzzle, index) => {
                const isAvailable = isPuzzleAvailable(puzzle.publishedAt);
                const isSolved = solvedPuzzleIds.includes(puzzle.id);
                const isLocked = !isAvailable;

                const statusLabel = isLocked
                  ? page.statusLocked
                  : isSolved
                    ? page.statusSolved
                    : puzzle.status === "new"
                      ? page.statusNew
                      : page.statusNormal;

                const nodeClassName = [
                  "magic-orb-node",
                  index % 2 === 0
                    ? "magic-orb-node-left"
                    : "magic-orb-node-right",
                ].join(" ");

                const orbClassName = [
                  "magic-crystal-orb",
                  isLocked ? "magic-crystal-orb-locked" : "",
                  isSolved ? "magic-crystal-orb-solved" : "",
                  puzzle.status === "new" && !isSolved
                    ? "magic-crystal-orb-new"
                    : "",
                ].join(" ");

                return (
                  <article key={puzzle.id} className={nodeClassName}>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => openPuzzle(puzzle)}
                      className={orbClassName}
                      aria-label={getText(puzzle.title, lang)}
                    >
                      <span className="magic-crystal-orb-core" />
                    </button>

                    <div className="magic-orb-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-violet-100">
                          {statusLabel}
                        </span>
                        <span className="text-xs text-slate-300">
                          {formatDate(puzzle.publishedAt, lang)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {getText(puzzle.title, lang)}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {getText(puzzle.clue, lang)}
                      </p>

                      <p className="mt-3 text-sm text-amber-100/90">
                        {page.reward}: {getText(puzzle.reward, lang)}
                      </p>

                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => openPuzzle(puzzle)}
                        className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                      >
                        {isLocked ? page.statusLocked : page.openOrb}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {totalTracks > 1 ? (
          <div className="magic-pagination">
            <button
              type="button"
              onClick={() => {
                const nextTrack = Math.max(currentTrack - 1, 1);
                setCurrentTrack(nextTrack);
                setJumpTrack(String(nextTrack));
              }}
              disabled={currentTrack === 1}
              className="magic-pagination-button"
            >
              {page.prevTrack}
            </button>

            <div className="text-center text-sm text-violet-100">
              {page.trackLabel} {currentTrack} / {totalTracks}
            </div>

            <button
              type="button"
              onClick={() => {
                const nextTrack = Math.min(currentTrack + 1, totalTracks);
                setCurrentTrack(nextTrack);
                setJumpTrack(String(nextTrack));
              }}
              disabled={currentTrack === totalTracks}
              className="magic-pagination-button"
            >
              {page.nextTrack}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-violet-100 md:col-span-3">
              <span>{page.goToTrack}</span>
              <input
                type="number"
                min={1}
                max={totalTracks}
                value={jumpTrack}
                onChange={(event) => setJumpTrack(event.target.value)}
                className="w-20 rounded-full border border-white/15 bg-slate-950/60 px-4 py-2 text-center text-white outline-none focus:border-violet-200/60"
              />
              <span>{page.trackSection}</span>
              <button
                type="button"
                onClick={handleJumpTrack}
                className="rounded-full bg-violet-100 px-5 py-2 font-medium text-violet-950 transition hover:bg-white"
              >
                {page.calibrate}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedPuzzle ? (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/80 px-5 py-10 backdrop-blur-md">
          <button
            type="button"
            aria-label={page.close}
            onClick={closePuzzle}
            className="absolute inset-0 cursor-default"
          />

          <div className="magic-overlay-orb" />

          <section className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/15 bg-slate-950/70 p-6 text-white shadow-2xl shadow-violet-950/50 backdrop-blur-xl md:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200/80">
                  {formatDate(selectedPuzzle.publishedAt, lang)}
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  {getText(selectedPuzzle.title, lang)}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePuzzle}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-slate-950"
              >
                {page.close}
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-200">
                {page.clue}
              </p>
              <p className="mt-3 leading-7 text-slate-100">
                {getText(selectedPuzzle.clue, lang)}
              </p>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-200">
                {page.question}
              </p>
              <p className="mt-3 leading-7 text-slate-100">
                {getText(selectedPuzzle.question, lang)}
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitAnswer();
                  }
                }}
                placeholder={page.answerPlaceholder}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white outline-none placeholder:text-white/40 focus:border-violet-200/70"
              />

              <button
                type="button"
                onClick={submitAnswer}
                className="rounded-full bg-violet-100 px-6 py-3 font-medium text-violet-950 transition hover:bg-white"
              >
                {page.submitAnswer}
              </button>
            </div>

            {answerResult ? (
              <div
                className={[
                  "mt-5 rounded-[1.5rem] border p-5",
                  answerResult === "correct"
                    ? "border-emerald-200/30 bg-emerald-200/10"
                    : "border-rose-200/30 bg-rose-200/10",
                ].join(" ")}
              >
                <p className="font-medium">
                  {answerResult === "correct" ? page.correct : page.wrong}
                </p>

                {answerResult === "correct" ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-100">
                      {page.unlocked}
                    </p>
                    <p className="mt-3 leading-7 text-slate-100">
                      {getText(selectedPuzzle.unlockedMessage, lang)}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}