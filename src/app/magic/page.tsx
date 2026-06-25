"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/data/i18n";

type LocalizedText = {
  cn: string;
  en: string;
};

type MagicPuzzleStatus = "sleeping" | "available" | "solved" | "hidden";
type MagicLoadStatus = "loading" | "allowed" | "signedOut" | "forbidden" | "error";

type MagicPuzzleRpcRow = {
  id: string;
  slug: string;
  title_cn: string;
  title_en: string;
  teaser_cn: string;
  teaser_en: string;
  riddle_cn: string;
  riddle_en: string;
  hint_cn: string | null;
  hint_en: string | null;
  unlock_note_cn: string | null;
  unlock_note_en: string | null;
  status: "active" | "hidden";
  publish_at: string;
  created_at: string;
  is_unlocked: boolean;
  display_status: MagicPuzzleStatus;
  reward_energy: number;
  has_hint: boolean;
  hint_is_unlocked: boolean;
  surprise_title_cn: string | null;
  surprise_title_en: string | null;
  surprise_note_cn: string | null;
  surprise_note_en: string | null;
};

type MagicPuzzle = {
  id: string;
  slug: string;
  month: string;
  publishedAt: string;
  reward: LocalizedText;
  title: LocalizedText;
  teaser: LocalizedText;
  clue: LocalizedText;
  question: LocalizedText;
  hint: LocalizedText;
  unlockedMessage: LocalizedText;
  displayStatus: MagicPuzzleStatus;
  isUnlocked: boolean;
  rewardEnergy: number;
  hasHint: boolean;
  hintIsUnlocked: boolean;
  surpriseTitle: LocalizedText;
  surpriseNote: LocalizedText;
};

const ITEMS_PER_TRACK = 6;

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
    loading: "正在读取水晶球星轨……",
    signedOut: "请先登录后进入魔法空间。",
    forbidden: "当前身份暂时不能进入魔法空间。",
    loadError: "魔法空间读取失败。",
    statusHidden: "已隐藏",
    sleepingOrbText: "这颗水晶球还在沉睡。",
    hintLockedPreview: "线索尚未打开。进入水晶球后可花 1 星光值查看。",
    noHintText: "这颗水晶球没有额外线索。",
    hintLockedTitle: "线索未打开",
    hintLockedIntro: "可以花费 1 星光值打开这颗水晶球的额外线索。",
    unlockingHint: "正在打开……",
    unlockHintButton: "花 1 星光值打开线索",
    hintOpened: "线索已打开。",
    answerReward: "答对奖励",
    litBadge: "已点亮",
    waitingBadge: "等待解锁",
    litTitle: "水晶球已点亮",
    starlightAdded: "星光值已加入爱心星球。",
    goToStudio: "去记忆暗房",
    continueTrack: "继续看星轨",
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
    loading: "Loading crystal orbs...",
    signedOut: "Please sign in before entering the magic room.",
    forbidden: "Your current role cannot enter the magic room yet.",
    loadError: "Failed to load magic room.",
    statusHidden: "Hidden",
    sleepingOrbText: "This crystal orb is still sleeping.",
    hintLockedPreview: "The clue is still locked. Enter the orb to spend 1 starlight value and reveal it.",
    noHintText: "This crystal orb has no extra clue.",
    hintLockedTitle: "Clue locked",
    hintLockedIntro: "Spend 1 starlight value to reveal this crystal orb's extra clue.",
    unlockingHint: "Opening...",
    unlockHintButton: "Spend 1 starlight value to reveal clue",
    hintOpened: "Clue opened.",
    answerReward: "Reward for solving",
    litBadge: "Lit",
    waitingBadge: "Waiting to unlock",
    litTitle: "Crystal orb lit",
    starlightAdded: "Starlight value has been added to Heart Planet.",
    goToStudio: "Go to Memory Darkroom",
    continueTrack: "Continue star track",
  },
};

function getText(text: LocalizedText, lang: Lang) {
  return text[lang];
}

function isPuzzleAvailable(puzzle: MagicPuzzle) {
  return puzzle.displayStatus === "available" || puzzle.displayStatus === "solved";
}

function formatDate(publishedAt: string, lang: Lang) {
  const date = new Date(publishedAt);

  if (lang === "cn") {
    return `北京时间 ${new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)}`;
  }

  return `Beijing time ${new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

function getBeijingMonthValue(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(value));

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";

  return `${year}-${month}`;
}

function mapMagicPuzzleRow(row: MagicPuzzleRpcRow): MagicPuzzle {
  return {
    id: row.id,
    slug: row.slug,
    month: getBeijingMonthValue(row.publish_at),
    publishedAt: row.publish_at,
    reward: {
      cn: `+${row.reward_energy} 星光值`,
      en: `+${row.reward_energy} starlight value`,
    },
    rewardEnergy: row.reward_energy,
    hasHint: Boolean(row.has_hint),
    hintIsUnlocked: Boolean(row.hint_is_unlocked),
    surpriseTitle: {
      cn: row.surprise_title_cn ?? "记忆暗房提醒",
      en: row.surprise_title_en ?? "Memory Darkroom Notice",
    },
    surpriseNote: {
      cn:
        row.surprise_note_cn ??
        "一段新的记忆可能已经在暗房里醒来。",
      en:
        row.surprise_note_en ??
        "A new memory may have awakened in the darkroom.",
    },
    title: {
      cn: row.title_cn,
      en: row.title_en,
    },
    teaser: {
      cn: row.teaser_cn,
      en: row.teaser_en,
    },
    clue: {
      cn: row.hint_cn ?? "",
      en: row.hint_en ?? "",
    },
    question: {
      cn: row.riddle_cn,
      en: row.riddle_en,
    },
    hint: {
      cn: row.hint_cn ?? "",
      en: row.hint_en ?? "",
    },
    unlockedMessage: {
      cn: row.unlock_note_cn ?? "水晶球已经被点亮。",
      en: row.unlock_note_en ?? "The crystal orb is lit.",
    },
    displayStatus: row.display_status,
    isUnlocked: row.is_unlocked,
  };
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

  export default function MagicPage() {
    const { lang, t } = useLanguage();
    const page = pageCopies[lang];
    const supabase = useMemo(() => createClient(), []);

    const [magicPuzzles, setMagicPuzzles] = useState<MagicPuzzle[]>([]);
    const [magicLoadStatus, setMagicLoadStatus] =
      useState<MagicLoadStatus>("loading");
    const [magicLoadMessage, setMagicLoadMessage] = useState("");

    const monthOptions = useMemo(() => {
      return Array.from(new Set(magicPuzzles.map((puzzle) => puzzle.month))).sort(
        (a, b) => b.localeCompare(a),
      );
    }, [magicPuzzles]);

    const [selectedMonth, setSelectedMonth] = useState("");
    const [currentTrack, setCurrentTrack] = useState(1);
    const [jumpTrack, setJumpTrack] = useState("1");
    const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
    const [answerInput, setAnswerInput] = useState("");
    const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(
      null,
    );
    const [answerMessage, setAnswerMessage] = useState("");
    const [isUnlockingHint, setIsUnlockingHint] = useState(false);
    const [hintMessage, setHintMessage] = useState("");

    const selectedPuzzle =
      magicPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId) ?? null;

    const filteredPuzzles = useMemo(() => {
      return magicPuzzles
        .filter((puzzle) => puzzle.month === selectedMonth)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );
    }, [magicPuzzles, selectedMonth]);

    const totalTracks = Math.max(
      1,
      Math.ceil(filteredPuzzles.length / ITEMS_PER_TRACK),
    );

    const visiblePuzzles = filteredPuzzles.slice(
      (currentTrack - 1) * ITEMS_PER_TRACK,
      currentTrack * ITEMS_PER_TRACK,
    );

    async function loadMagicPuzzles() {
      setMagicLoadStatus("loading");
      setMagicLoadMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setMagicLoadStatus("error");
        setMagicLoadMessage(userError.message);
        setMagicPuzzles([]);
        return;
      }

      if (!user) {
        setMagicLoadStatus("signedOut");
        setMagicPuzzles([]);
        return;
      }

      const { data, error } = await supabase.rpc("get_magic_puzzles");

      if (error) {
        const message = error.message;

        if (message.includes("当前身份")) {
          setMagicLoadStatus("forbidden");
        } else {
          setMagicLoadStatus("error");
        }

        setMagicLoadMessage(message);
        setMagicPuzzles([]);
        return;
      }

      const rows = (data ?? []) as MagicPuzzleRpcRow[];

      setMagicPuzzles(rows.map(mapMagicPuzzleRow));
      setMagicLoadStatus("allowed");
    }

    useEffect(() => {
      void loadMagicPuzzles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (monthOptions.length === 0) {
        setSelectedMonth("");
        return;
      }

      if (!selectedMonth || !monthOptions.includes(selectedMonth)) {
        setSelectedMonth(monthOptions[0]);
      }
    }, [monthOptions, selectedMonth]);

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
      if (!isPuzzleAvailable(puzzle)) return;

      setSelectedPuzzleId(puzzle.id);
      setAnswerInput("");
      setAnswerResult(null);
      setAnswerMessage("");
      setHintMessage("");
      setIsUnlockingHint(false);
    }

    function closePuzzle() {
      setSelectedPuzzleId(null);
      setAnswerInput("");
      setAnswerResult(null);
      setAnswerMessage("");
      setHintMessage("");
      setIsUnlockingHint(false);
    }

    async function submitAnswer() {
      if (!selectedPuzzle) return;

      setAnswerResult(null);
      setAnswerMessage("");

      const { data, error } = await supabase.rpc("submit_magic_answer", {
        puzzle_id_input: selectedPuzzle.id,
        answer_input: answerInput,
      });

      if (error) {
        setAnswerResult("wrong");
        setAnswerMessage(error.message);
        return;
      }

      const result = data?.[0];

      if (result?.is_correct) {
        setAnswerResult("correct");
        setAnswerMessage(result.result_message ?? page.correct);
        await loadMagicPuzzles();
        return;
      }

      setAnswerResult("wrong");
      setAnswerMessage(result?.result_message ?? page.wrong);
    }

    async function unlockHint() {
      if (!selectedPuzzle) return;

      setIsUnlockingHint(true);
      setHintMessage("");

      const { data, error } = await supabase.rpc("unlock_magic_hint", {
        puzzle_id_input: selectedPuzzle.id,
      });

      if (error) {
        setHintMessage(error.message);
        setIsUnlockingHint(false);
        return;
      }

      const result = data?.[0] as
        | {
            hint_cn: string | null;
            hint_en: string | null;
            result_message: string | null;
          }
        | undefined;

      setMagicPuzzles((current) =>
        current.map((puzzle) => {
          if (puzzle.id !== selectedPuzzle.id) return puzzle;

          const nextHint = {
            cn: result?.hint_cn ?? puzzle.clue.cn,
            en: result?.hint_en ?? puzzle.clue.en,
          };

          return {
            ...puzzle,
            clue: nextHint,
            hint: nextHint,
            hintIsUnlocked: true,
          };
        }),
      );

      setHintMessage(result?.result_message ?? page.hintOpened);

      await loadMagicPuzzles();

      setIsUnlockingHint(false);
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
              {selectedMonth ? getMonthLabel(selectedMonth, lang) : page.empty}
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

        {magicLoadStatus !== "allowed" ? (
          <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-5 text-sm text-slate-200">
            {magicLoadStatus === "loading" ? page.loading : null}
            {magicLoadStatus === "signedOut" ? page.signedOut : null}
            {magicLoadStatus === "forbidden" ? page.forbidden : null}
            {magicLoadStatus === "error" ? `${page.loadError} ${magicLoadMessage}` : null}
          </div>
        ) : null}

        <section className="magic-track-panel" aria-label={page.trackLabel}>
          <div className="magic-track-line" />

          {visiblePuzzles.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center text-slate-200">
              {page.empty}
            </div>
          ) : (
            <div className="relative z-10 grid gap-10 py-4">
              {visiblePuzzles.map((puzzle, index) => {
                const isAvailable = isPuzzleAvailable(puzzle);
                const isSolved = puzzle.displayStatus === "solved";
                const isLocked = !isAvailable;

                const statusLabel =
                  puzzle.displayStatus === "sleeping"
                    ? page.statusLocked
                    : puzzle.displayStatus === "hidden"
                      ? page.statusHidden
                      : isSolved
                        ? page.statusSolved
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
                  puzzle.displayStatus === "available" && !isSolved
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
                        {getText(puzzle.teaser, lang)}
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

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1 text-amber-100">
                  {page.answerReward} {getText(selectedPuzzle.reward, lang)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-200">
                  {selectedPuzzle.displayStatus === "solved" ? page.litBadge : page.waitingBadge}
                </span>
              </div>

              <button
                type="button"
                onClick={closePuzzle}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-slate-950"
              >
                {page.close}
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-200">
                {page.question}
              </p>
              <p className="mt-3 leading-7 text-slate-100">
                {getText(selectedPuzzle.question, lang)}
              </p>
            </div>

            {selectedPuzzle.displayStatus === "solved" ? (
              <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-100">
                    {page.litTitle}
                  </p>
                  <p className="mt-3 leading-7 text-slate-100">
                    {getText(selectedPuzzle.unlockedMessage, lang)}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4">
                  <p className="text-sm font-semibold text-amber-100">
                    +{selectedPuzzle.rewardEnergy} 星光值
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {page.starlightAdded}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-200/20 bg-violet-100/10 p-4">
                  <p className="text-sm font-semibold text-violet-100">
                    {getText(selectedPuzzle.surpriseTitle, lang)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {getText(selectedPuzzle.surpriseNote, lang)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/studio"
                    className="rounded-full bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-950 transition hover:bg-white"
                  >
                    {page.goToStudio}
                  </a>

                  <button
                    type="button"
                    onClick={closePuzzle}
                    className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white hover:text-slate-950"
                  >
                    {page.continueTrack}
                  </button>
                </div>
              </div>
            ) : null}

            {selectedPuzzle.displayStatus !== "solved" ? (
              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void submitAnswer();
                  }
                }}
                placeholder={page.answerPlaceholder}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white outline-none placeholder:text-white/40 focus:border-violet-200/70"
              />

              <button
                type="button"
                onClick={() => void submitAnswer()}
                className="rounded-full bg-violet-100 px-6 py-3 font-medium text-violet-950 transition hover:bg-white"
              >
                {page.submitAnswer}
              </button>
            </div>
            ) : null}

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
                  {answerMessage ||
                    (answerResult === "correct" ? page.correct : page.wrong)}
                </p>

                {answerResult === "correct" ? (
                  <div className="mt-4 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-amber-100">
                        {page.unlocked}
                      </p>
                      <p className="mt-3 leading-7 text-slate-100">
                        {getText(selectedPuzzle.unlockedMessage, lang)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4">
                      <p className="text-sm font-semibold text-amber-100">
                        +{selectedPuzzle.rewardEnergy} 星光值
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        星光值已加入爱心星球。
                      </p>
                    </div>

                    <div className="rounded-2xl border border-violet-200/20 bg-violet-100/10 p-4">
                      <p className="text-sm font-semibold text-violet-100">
                        {getText(selectedPuzzle.surpriseTitle, lang)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {getText(selectedPuzzle.surpriseNote, lang)}
                      </p>
                    </div>
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