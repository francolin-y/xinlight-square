"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CheckinToast } from "@/components/CheckinToast";
import { useLanguage } from "@/components/LanguageProvider";

const START_DATE = new Date("2025-04-19");

function getDaysTogether() {
  const now = new Date();
  const diff = now.getTime() - START_DATE.getTime();

  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
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

function getCurrentMonthCalendar(): CalendarCell[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

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
    cells.push({
      key: `day-${day}`,
      day,
      checked: day <= today,
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

export default function HomePage() {
  const { lang, t } = useLanguage();
  const monthCalendar = getCurrentMonthCalendar();
  const monthLabel = getCurrentMonthLabel(lang);

  return (
    <PageShell
      title={t.home.title}
      intro={t.home.intro}
      loadingTitle={t.home.loadingTitle}
      loadingSubtitle={t.home.loadingSubtitle}
      loadingVariant="cloud"
      backgroundVariant="plaza"
    >
      <CheckinToast 
        title={t.home.checkinToastTitle}
        subtitle={t.home.checkinToastSubtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">{t.home.daysTogether}</p>
              <p className="mt-3 text-4xl font-semibold">
                {getDaysTogether()}
                <span className="ml-2 text-base text-slate-400">
                  {t.home.daysUnit}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">{t.home.currentEnergy}</p>
              <p className="mt-3 text-4xl font-semibold">1314</p>
            </div>

            <div className="flex flex-col justify-between rounded-3xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">{t.home.goMarket}</p>
              <Link
                href="/market"
                className="mt-5 rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-sky-100"
              >
                {t.home.goMarket}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-sm text-emerald-100">{t.home.todayCheckin}</p>
              <p className="mt-3 text-2xl font-semibold">{t.home.completed}</p>
            </div>

            <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
              <p className="text-sm text-amber-100">{t.home.todayPuzzle}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-2xl font-semibold">{t.home.incomplete}</p>
                <Link
                  href="/magic"
                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-slate-950"
                >
                  {t.home.startPuzzle}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">{t.home.calendarTitle}</h2>
            <p className="text-sm text-slate-400">{monthLabel}</p>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekdays[lang].map((weekday) => (
              <div
                key={weekday}
                className="text-center text-xs font-medium text-slate-400"
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
                      ? "bg-sky-200 text-slate-950"
                      : "bg-white/10 text-slate-400",
                    item.isToday ? "ring-2 ring-white/70" : "",
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