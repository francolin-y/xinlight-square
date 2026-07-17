"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { CheckinToast } from "@/components/CheckinToast";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

const START_DATE = {
  year: 2025,
  month: 4,
  day: 19,
};

function getLocalDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysTogether() {
  const startDate = new Date(
    START_DATE.year,
    START_DATE.month - 1,
    START_DATE.day
  );

  const today = getLocalDateOnly(new Date());

  const diff = today.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(1, days);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return {
    start: getLocalDateKey(new Date(year, month, 1)),
    end: getLocalDateKey(new Date(year, month + 1, 0)),
  };
}

type CalendarCell = {
  key: string;
  day: number | null;
  checked: boolean;
  isToday: boolean;
  isFuture: boolean;
};

const weekdays = {
  cn: ["日", "一", "二", "三", "四", "五", "六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

type DailyCheckinRow = {
  checkin_date: string;
};

type EnergyTransactionRow = {
  amount: number | null;
};

type TodayPuzzleStatus = "loading" | "completed" | "incomplete" | "empty" | "error";

type PlazaMagicPuzzleRow = {
  id: string;
  status: "active" | "hidden";
  publish_at: string;
  is_unlocked: boolean;
  display_status: "sleeping" | "available" | "solved" | "hidden";
};

const checkinCopies = {
  cn: {
    loading: "正在读取",
    waiting: "等待签到",
    completed: "今日已签到",
    locked: "仅小欣可签到",
    button: "今日签到",
    alreadyChecked: "今天已经签到过啦。",
    success: "签到成功，今天也收集到一颗星光。",
    onlyHeroine: "目前只有女主角可以签到哦。",
    signInRequired: "请先登录小欣的账号。",
    failed: "签到失败",
  },
  en: {
    loading: "Loading",
    waiting: "Waiting",
    completed: "Checked in today",
    locked: "Stella only",
    button: "Check in today",
    alreadyChecked: "Already checked in today.",
    success: "Check-in succeeded. A piece of starlight was collected today.",
    onlyHeroine: "Only the heroine account can check in for now.",
    signInRequired: "Please sign in as the heroine first.",
    failed: "Check-in failed",
  },
};

const plazaActionCopies = {
  cn: {
    redeemOnlyHeroine: "仅小欣可兑换",
    solveOnlyHeroine: "仅小欣可解谜",
  },
  en: {
    redeemOnlyHeroine: "Only Heroine can redeem",
    solveOnlyHeroine: "Only Heroine can solve",
  },
};

const todayPuzzleCopies = {
  cn: {
    loading: "正在读取",
    completed: "今日已完成",
    incomplete: "今日未完成",
    empty: "今日暂无题目",
    error: "读取失败",
  },
  en: {
    loading: "Loading",
    completed: "Completed today",
    incomplete: "Incomplete today",
    empty: "No puzzle today",
    error: "Failed to load",
  },
};

function getCurrentMonthCalendar(checkinDates: string[]): CalendarCell[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const checkedDateSet = new Set(checkinDates);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      day: null,
      checked: false,
      isToday: false,
      isFuture: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getLocalDateKey(new Date(year, month, day));

    cells.push({
      key: `day-${day}`,
      day,
      checked: checkedDateSet.has(dateKey),
      isToday: day === today,
      isFuture: day > today,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `empty-end-${cells.length}`,
      day: null,
      checked: false,
      isToday: false,
      isFuture: false,
    });
  }

  return cells;
}

function getCurrentMonthLabel(lang: "cn" | "en") {
  const now = new Date();

  if (lang === "cn") {
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);
}

function getBeijingDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const { lang, t } = useLanguage();
  const supabase = createClient();
  const checkinCopy = checkinCopies[lang];
  const actionCopy = plazaActionCopies[lang];
  const todayPuzzleCopy = todayPuzzleCopies[lang];

  const [daysTogether, setDaysTogether] = useState(getDaysTogether());
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(true);
  const [checkinStatus, setCheckinStatus] = useState("");
  const [checkinToastKey, setCheckinToastKey] = useState(0);
  const [currentEnergy, setCurrentEnergy] = useState(0);
  const [isLoadingEnergy, setIsLoadingEnergy] = useState(true);
  const [todayPuzzleStatus, setTodayPuzzleStatus] =
    useState<TodayPuzzleStatus>("loading");

  const todayKey = getLocalDateKey(new Date());
  const hasCheckedInToday = checkinDates.includes(todayKey);
  const canCheckIn = role === "heroine";
  const canUseHeroineActions = role === "heroine";

  const marketActionLabel = canUseHeroineActions
    ? t.home.goMarket
    : actionCopy.redeemOnlyHeroine;

  const puzzleActionLabel = canUseHeroineActions
    ? t.home.startPuzzle
    : actionCopy.solveOnlyHeroine;

  const todayPuzzleLabel =
    todayPuzzleStatus === "loading"
      ? todayPuzzleCopy.loading
      : todayPuzzleStatus === "completed"
        ? todayPuzzleCopy.completed
        : todayPuzzleStatus === "empty"
          ? todayPuzzleCopy.empty
          : todayPuzzleStatus === "error"
            ? todayPuzzleCopy.error
            : todayPuzzleCopy.incomplete;


  const monthCalendar = getCurrentMonthCalendar(checkinDates);
  const monthLabel = getCurrentMonthLabel(lang);

  async function loadCurrentProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setRole(null);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      setRole(null);
      return;
    }

    setRole(data.role as ProfileRole);
  }

  async function loadCheckins() {
    setIsLoadingCheckins(true);

    const { start, end } = getCurrentMonthRange();

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("checkin_date")
      .gte("checkin_date", start)
      .lte("checkin_date", end)
      .order("checkin_date", { ascending: true });

    if (error) {
      setCheckinStatus(`读取签到失败：${error.message}`);
      setCheckinDates([]);
      setIsLoadingCheckins(false);
      return;
    }

    setCheckinDates(
      (data as DailyCheckinRow[]).map((item) => item.checkin_date),
    );
    setIsLoadingCheckins(false);
  }

  async function loadEnergyBalance() {
    setIsLoadingEnergy(true);

    const { data, error } = await supabase
      .from("energy_transactions")
      .select("amount");

    if (error) {
      setCheckinStatus(`读取星光值失败：${error.message}`);
      setCurrentEnergy(0);
      setIsLoadingEnergy(false);
      return;
    }

    const total = (data as EnergyTransactionRow[]).reduce(
      (sum, item) => sum + (item.amount ?? 0),
      0,
    );

    setCurrentEnergy(total);
    setIsLoadingEnergy(false);
  }

  async function loadTodayPuzzleStatus() {
    setTodayPuzzleStatus("loading");

    const { data, error } = await supabase.rpc("get_magic_puzzles");

    if (error) {
      setTodayPuzzleStatus("error");
      return;
    }

    const todayBeijingKey = getBeijingDateKey(new Date());
    const rows = (data ?? []) as PlazaMagicPuzzleRow[];

    const todayPuzzles = rows.filter((puzzle) => {
      if (puzzle.status === "hidden" || puzzle.display_status === "hidden") {
        return false;
      }

      return getBeijingDateKey(new Date(puzzle.publish_at)) === todayBeijingKey;
    });

    if (todayPuzzles.length === 0) {
      setTodayPuzzleStatus("empty");
      return;
    }

    const hasCompletedTodayPuzzle = todayPuzzles.some(
      (puzzle) => puzzle.is_unlocked || puzzle.display_status === "solved",
    );

    setTodayPuzzleStatus(
      hasCompletedTodayPuzzle ? "completed" : "incomplete",
    );
  }

  async function handleCheckin() {
    if (!canCheckIn) {
      setCheckinStatus(checkinCopy.onlyHeroine);
      return;
    }

    if (hasCheckedInToday) {
      setCheckinStatus(checkinCopy.alreadyChecked);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckinStatus(checkinCopy.signInRequired);
      return;
    }

    const { error } = await supabase.from("daily_checkins").insert({
      user_id: user.id,
      checkin_date: todayKey,
    });

    if (error) {
      if (error.code === "23505") {
        setCheckinDates((current) =>
          current.includes(todayKey) ? current : [...current, todayKey],
        );
        await loadEnergyBalance();
        setCheckinStatus(checkinCopy.alreadyChecked);
        return;
      }

      setCheckinStatus(`${checkinCopy.failed}：${error.message}`);
      return;
    }

    setCheckinDates((current) =>
      current.includes(todayKey) ? current : [...current, todayKey],
    );

    await loadEnergyBalance();

    setCheckinStatus(checkinCopy.success);
    setCheckinToastKey(Date.now());
  }

  useEffect(() => {
    loadCurrentProfile();
    loadCheckins();
    loadEnergyBalance();
    loadTodayPuzzleStatus();

    const handleFocus = () => {
      void loadTodayPuzzleStatus();
      void loadEnergyBalance();
    };

    window.addEventListener("focus", handleFocus);

    const timer = window.setInterval(() => {
      setDaysTogether(getDaysTogether());
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      title={t.home.title}
      intro={t.home.intro}
      loadingTitle={t.home.loadingTitle}
      loadingSubtitle={t.home.loadingSubtitle}
      loadingVariant="cloud"
      backgroundVariant="plaza"
      fontVariant="plaza"
    >
      {checkinToastKey > 0 ? (
        <CheckinToast
          key={checkinToastKey}
          title={t.home.checkinToastTitle}
          subtitle={t.home.checkinToastSubtitle}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/20 bg-slate-950/25 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/25 bg-white/45 p-5 text-slate-950 shadow-lg backdrop-blur">
              <p className="text-sm text-slate-700">{t.home.daysTogether}</p>
              <p className="mt-3 text-4xl font-semibold">
                {daysTogether}
                <span className="ml-2 text-base text-slate-700">
                  {t.home.daysUnit}
                </span>
              </p>
            </div>

            <div className="rounded-3xl border border-white/25 bg-white/45 p-5 text-slate-950 shadow-lg backdrop-blur">
              <p className="text-sm text-slate-700">{t.home.currentEnergy}</p>
              <p className="mt-3 text-4xl font-semibold">{currentEnergy}</p>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-slate-950/55 p-5 shadow-lg backdrop-blur">
              <p className="text-sm text-slate-100">{marketActionLabel}</p>
              <Link
                href="/market"
                className="mt-5 rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-sky-100"
              >
                {marketActionLabel}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200/30 bg-emerald-300/20 p-5 shadow-lg backdrop-blur">
              <p className="text-sm text-emerald-50">{t.home.todayCheckin}</p>

              <p className="mt-3 text-2xl font-semibold text-white">
                {isLoadingCheckins
                  ? checkinCopy.loading
                  : hasCheckedInToday
                    ? checkinCopy.completed
                    : canCheckIn
                      ? checkinCopy.waiting
                      : checkinCopy.locked}
              </p>

              <button
                type="button"
                onClick={handleCheckin}
                disabled={isLoadingCheckins || hasCheckedInToday || !canCheckIn}
                className={[
                  "mt-4 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
                  !isLoadingCheckins && !hasCheckedInToday && canCheckIn
                    ? "bg-white text-emerald-950 hover:bg-emerald-100"
                    : "bg-white/15 text-white/50",
                ].join(" ")}
              >
                {hasCheckedInToday ? checkinCopy.completed : checkinCopy.button}
              </button>

              {checkinStatus ? (
                <p className="mt-3 text-sm leading-6 text-emerald-50/85">
                  {checkinStatus}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-amber-200/30 bg-amber-300/20 p-5 shadow-lg backdrop-blur">
              <p className="text-sm text-amber-50">{t.home.todayPuzzle}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-2xl font-semibold text-white">
                  {todayPuzzleLabel}
                </p>
                <Link
                  href="/magic"
                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white"
                >
                  {puzzleActionLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/20 bg-white/35 p-6 text-slate-950 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">{t.home.calendarTitle}</h2>
            <p className="text-sm text-slate-700">{monthLabel}</p>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekdays[lang].map((weekday) => (
              <div
                key={weekday}
                className="text-center text-xs font-medium text-slate-700"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthCalendar.map((item) => {
              if (item.day === null) {
                return <div key={item.key} className="aspect-square" />;
              }

              return (
                <div
                  key={item.key}
                  className={[
                    "grid aspect-square place-items-center rounded-2xl text-sm transition",
                    item.checked
                      ? "bg-sky-200 text-slate-950 shadow-sm"
                      : "bg-white/30 text-slate-700",
                    item.isToday ? "ring-2 ring-white/80" : "",
                    item.isFuture ? "opacity-40" : "",
                  ].join(" ")}
                >
                  {item.day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}