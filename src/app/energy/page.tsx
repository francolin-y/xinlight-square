"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

type EnergyBill = {
  id: string;
  date: string;
  time: string;
  amount: number;
  label: {
    cn: string;
    en: string;
  };
};

const energyCopies = {
  cn: {
    standardTitle: "星光值收支标准",
    overviewTitle: "今日能量概览",
    billTitle: "星光值账单",
    totalEnergy: "当前星光值",
    todayGain: "今日已获得",
    todaySpend: "今日已消耗",
    statusLabel: "充能状态",
    emptyBill: "还没有星光值流水",
    status: {
      sufficient: "充足",
      stable: "稳定",
      low: "不足",
    },
    standard: [
      ["每日签到", "+10"],
      ["点击网站", "+1"],
      ["揭开谜题", "+50"],
      ["发现彩蛋", "+15"],
      ["写一句留言", "+10"],
      ["兑换礼物", "-1"],
    ],
  },
  en: {
    standardTitle: "Starlight Rules",
    overviewTitle: "Today’s Energy Overview",
    billTitle: "Starlight Bill",
    totalEnergy: "Current Starlight",
    todayGain: "Gained Today",
    todaySpend: "Spent Today",
    statusLabel: "Charging Status",
    emptyBill: "No starlight activity yet",
    status: {
      sufficient: "Sufficient",
      stable: "Stable",
      low: "Low",
    },
    standard: [
      ["Daily check-in", "+10"],
      ["Website click", "+1"],
      ["Solved puzzle", "+50"],
      ["Easter egg discovered", "+15"],
      ["Message written", "+10"],
      ["Gift redeemed", "-1"],
    ],
  },
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDemoBills(todayKey: string): EnergyBill[] {
  return [
    {
      id: "daily-checkin",
      date: todayKey,
      time: "09:12",
      amount: 10,
      label: {
        cn: "每日签到",
        en: "Daily check-in",
      },
    },
    {
      id: "website-click",
      date: todayKey,
      time: "10:36",
      amount: 1,
      label: {
        cn: "点击网站",
        en: "Website click",
      },
    },
    {
      id: "message-written",
      date: todayKey,
      time: "14:20",
      amount: 10,
      label: {
        cn: "写一句留言",
        en: "Message written",
      },
    },
    {
      id: "gift-redeemed",
      date: todayKey,
      time: "20:18",
      amount: -1,
      label: {
        cn: "兑换礼物",
        en: "Gift redeemed",
      },
    },
  ];
}

function getChargingStatus(todayGain: number) {
  if (todayGain > 50) {
    return "sufficient";
  }

  if (todayGain > 15) {
    return "stable";
  }

  return "low";
}

function EnergyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/backgrounds/energy/energy-bg-mobile.png"
        />
        <img
          src="/backgrounds/energy/energy-bg-desktop.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </picture>

      <div className="absolute inset-0 bg-slate-950/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/55" />
    </div>
  );
}

export default function EnergyPage() {
  const { lang, t } = useLanguage();
  const page = energyCopies[lang];

  const todayKey = getLocalDateKey();
  const bills = getDemoBills(todayKey);

  const baseEnergy = 1294; // This can be fetched from user data in a real application

  const totalEnergy =
    baseEnergy + bills.reduce((sum, bill) => sum + bill.amount, 0);

  const todayGain = bills
    .filter((bill) => bill.date === todayKey && bill.amount > 0)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const todaySpend = Math.abs(
    bills
      .filter((bill) => bill.date === todayKey && bill.amount < 0)
      .reduce((sum, bill) => sum + bill.amount, 0),
  );

  const chargingStatus = getChargingStatus(todayGain);

  return (
    <PageShell
      title=""
      intro=""
      loadingTitle={t.energy.loadingTitle}
      loadingSubtitle={t.energy.loadingSubtitle}
      loadingVariant="heart"
      fontVariant="heart"
    >

      <EnergyBackground />
      
      <div className="relative z-10 -mt-18 grid gap-6">
        <section className="w-full max-w-xl justify-self-start rounded-[2rem] border border-white/15 bg-slate-950/35 p-6 shadow-l shadow-slate-950/25 backdrop-blur-md md:max-w-2xl md:p-10">
          <p className="font-heart-accent text-sm uppercase tracking-[0.35em] text-pink-100/80">
            {lang === "cn" ? "STELLA PLANET" : "STELLA PLANET"}
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            {t.energy.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-rose-100/90 md:text-lg">
            {t.energy.intro}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.todayGain}</p>
                  <p className="mt-3 text-3xl font-semibold text-pink-100">
                    +{todayGain}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.todaySpend}</p>
                  <p className="mt-3 text-3xl font-semibold text-rose-100">
                    -{todaySpend}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.statusLabel}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {page.status[chargingStatus]}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">{page.standardTitle}</h2>

            <div className="mt-6 grid gap-3">
              {page.standard.map(([label, amount]) => {
                const isGain = amount.startsWith("+");

                return (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 transition hover:bg-white/15"
                  >
                    <span className="text-slate-100">{label}</span>
                    <span
                      className={
                        isGain
                          ? "font-semibold text-pink-200"
                          : "font-semibold text-amber-100"
                      }
                    >
                      {amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/25 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{page.billTitle}</h2>
              <p className="mt-2 text-sm text-slate-300">{todayKey}</p>
            </div>

            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950">
              +{todayGain} / -{todaySpend}
            </div>
          </div>

          {bills.length > 0 ? (
            <div className="grid gap-3">
              {bills.map((bill) => {
                const isGain = bill.amount > 0;
                const displayAmount = isGain ? `+${bill.amount}` : bill.amount;

                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-50">
                        {bill.label[lang]}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {bill.date} · {bill.time}
                      </p>
                    </div>

                    <span
                      className={
                        isGain
                          ? "text-lg font-semibold text-pink-200"
                          : "text-lg font-semibold text-amber-100"
                      }
                    >
                      {displayAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-sm text-slate-300">
              {page.emptyBill}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}