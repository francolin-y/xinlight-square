"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const energyCopies = {
  cn: {
    sourceTitle: "星光值来源",
    overviewTitle: "今日能量概览",
    totalEnergy: "当前星光值",
    todayGain: "今日已获得",
    progressTitle: "下一次心动充能",
    progressText: "距离下一枚心动徽章还差 86 星光值",
    levelLabel: "心动进度",
    chargingStatus: "充能状态稳定",
    sources: [
      ["每日签到", "+10"],
      ["点击网站", "+1"],
      ["揭开谜题", "+50"],
      ["发现彩蛋", "+15"],
      ["写一句留言", "+10"],
    ],
  },
  en: {
    sourceTitle: "Starlight Sources",
    overviewTitle: "Today’s Energy Overview",
    totalEnergy: "Current Starlight",
    todayGain: "Gained Today",
    progressTitle: "Next Heart Charge",
    progressText: "86 starlight value away from the next heartbeat badge",
    levelLabel: "Heartbeat Progress",
    chargingStatus: "Charging status stable",
    sources: [
      ["Daily check-in", "+10"],
      ["Website visit", "+1"],
      ["Solved puzzle", "+50"],
      ["Easter egg discovered", "+15"],
      ["Message written", "+10"],
    ],
  },
};

export default function EnergyPage() {
  const { lang, t } = useLanguage();
  const page = energyCopies[lang];

  const totalEnergy = 1314;
  const todayGain = 21;
  const levelProgress = 64;

  return (
    <PageShell
      title={t.energy.title}
      intro={t.energy.intro}
      loadingTitle={t.energy.loadingTitle}
      loadingSubtitle={t.energy.loadingSubtitle}
      loadingVariant="heart"
      fontVariant="heart"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-rose-300/15 p-6 shadow-2xl shadow-rose-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-pink-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/20 text-4xl shadow-lg ring-1 ring-white/25">
              ♡
            </div>

            <p className="text-sm uppercase tracking-[0.28em] text-rose-100">
              {page.overviewTitle}
            </p>

            <h2 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
              {totalEnergy}
            </h2>

            <p className="mt-2 text-sm text-rose-100">{page.totalEnergy}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                <p className="text-sm text-rose-100">{page.todayGain}</p>
                <p className="mt-3 font-heart-accent text-3xl font-semibold">+{todayGain}</p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                <p className="text-sm text-rose-100">{page.chargingStatus}</p>
                <p className="mt-3 font-market-accent text-3xl font-semibold">Stable</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{page.progressTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {page.progressText}
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {levelProgress}%
            </div>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-slate-950/50 ring-1 ring-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-200 via-pink-300 to-violet-300 shadow-[0_0_24px_rgba(244,114,182,0.55)]"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/35 p-5">
            <h3 className="mb-4 text-lg font-semibold">{page.sourceTitle}</h3>

            <div className="grid gap-3">
              {page.sources.map(([label, amount]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 transition hover:bg-white/15"
                >
                  <span className="text-slate-100">{label}</span>
                  <span className="font-semibold text-pink-200">{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}