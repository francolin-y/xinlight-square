"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

type Lang = "cn" | "en";

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

type EnergyTransactionRow = {
  id: string;
  amount: number;
  transaction_type: "gain" | "spend";
  source: "checkin" | "manual";
  source_date: string | null;
  description: string | null;
  created_at: string;
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
    loadingBill: "正在读取星光值流水……",
    errorPrefix: "读取星光值流水失败",
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
    loadingBill: "Loading starlight activity...",
    errorPrefix: "Failed to load starlight activity",
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
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDisplayDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T00:00:00`);
  }

  return new Date(date);
}

function formatTransactionDate(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "cn" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(parseDisplayDate(date));
}

function formatTransactionTime(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "cn" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getEffectiveAmount(transaction: EnergyTransactionRow) {
  if (transaction.transaction_type === "spend") {
    return -Math.abs(transaction.amount);
  }

  return Math.abs(transaction.amount);
}

function getTransactionDateKey(transaction: EnergyTransactionRow) {
  if (transaction.source_date) {
    return transaction.source_date;
  }

  return getLocalDateKey(new Date(transaction.created_at));
}

function getTransactionLabel(transaction: EnergyTransactionRow) {
  if (transaction.description) {
    return {
      cn: transaction.description,
      en:
        transaction.source === "checkin"
          ? "Daily check-in"
          : transaction.description,
    };
  }

  if (transaction.source === "checkin") {
    return {
      cn: "每日签到",
      en: "Daily check-in",
    };
  }

  return {
    cn: "手动调整",
    en: "Manual adjustment",
  };
}

function mapTransactionToBill(
  transaction: EnergyTransactionRow,
  lang: Lang,
): EnergyBill {
  return {
    id: transaction.id,
    date: formatTransactionDate(
      transaction.source_date ?? transaction.created_at,
      lang,
    ),
    time: formatTransactionTime(transaction.created_at, lang),
    amount: getEffectiveAmount(transaction),
    label: getTransactionLabel(transaction),
  };
}

function getChargingStatus(todayGain: number): "sufficient" | "stable" | "low" {
  if (todayGain > 30) {
    return "sufficient";
  }

  if (todayGain > 10) {
    return "stable";
  }

  return "low";
}

export default function EnergyPage() {
  const { lang, t } = useLanguage();
  const page = energyCopies[lang];
  const supabase = createClient();

  const [transactions, setTransactions] = useState<EnergyTransactionRow[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState("");

  const todayKey = getLocalDateKey();

  async function loadEnergyTransactions() {
    setIsLoadingTransactions(true);

    const { data, error } = await supabase
      .from("energy_transactions")
      .select(
        "id, amount, transaction_type, source, source_date, description, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      setTransactionError(`${page.errorPrefix}：${error.message}`);
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    setTransactions((data ?? []) as EnergyTransactionRow[]);
    setTransactionError("");
    setIsLoadingTransactions(false);
  }

  useEffect(() => {
    loadEnergyTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentEnergy = useMemo(() => {
    return transactions.reduce((sum, transaction) => {
      return sum + getEffectiveAmount(transaction);
    }, 0);
  }, [transactions]);

  const todayGain = useMemo(() => {
    return transactions
      .filter((transaction) => {
        return (
          getTransactionDateKey(transaction) === todayKey &&
          getEffectiveAmount(transaction) > 0
        );
      })
      .reduce((sum, transaction) => sum + getEffectiveAmount(transaction), 0);
  }, [todayKey, transactions]);

  const todaySpend = useMemo(() => {
    return Math.abs(
      transactions
        .filter((transaction) => {
          return (
            getTransactionDateKey(transaction) === todayKey &&
            getEffectiveAmount(transaction) < 0
          );
        })
        .reduce((sum, transaction) => sum + getEffectiveAmount(transaction), 0),
    );
  }, [todayKey, transactions]);

  const bills = useMemo(() => {
    return transactions.map((transaction) =>
      mapTransactionToBill(transaction, lang),
    );
  }, [lang, transactions]);

  const chargingStatus = getChargingStatus(todayGain);

  return (
    <PageShell
      title={t.energy.title}
      intro={t.energy.intro}
      loadingTitle={t.energy.loadingTitle}
      loadingSubtitle={t.energy.loadingSubtitle}
      loadingVariant="heart"
      backgroundVariant="energy"
      fontVariant="heart"
    >
      <div className="grid gap-6">
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
                {isLoadingTransactions ? "..." : currentEnergy}
              </h2>

              <p className="mt-2 text-sm text-rose-100">{page.totalEnergy}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.todayGain}</p>
                  <p className="mt-3 text-3xl font-semibold text-pink-100">
                    {isLoadingTransactions ? "..." : `+${todayGain}`}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.todaySpend}</p>
                  <p className="mt-3 text-3xl font-semibold text-rose-100">
                    {isLoadingTransactions
                      ? "..."
                      : todaySpend > 0
                        ? `-${todaySpend}`
                        : "0"}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/15 p-5">
                  <p className="text-sm text-rose-100">{page.statusLabel}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {isLoadingTransactions
                      ? "..."
                      : page.status[chargingStatus]}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/20 bg-white/[0.03] p-6 shadow-2xl shadow-slate-950/15 backdrop-blur-md md:p-10">
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

        <section className="rounded-[2rem] border border-white/20 bg-white/[0.03] p-6 shadow-2xl shadow-slate-950/15 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{page.billTitle}</h2>
              <p className="mt-2 text-sm text-slate-300">{todayKey}</p>
            </div>

            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950">
              {isLoadingTransactions ? "..." : `+${todayGain} / -${todaySpend}`}
            </div>
          </div>

          {isLoadingTransactions ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-sm text-slate-300">
              {page.loadingBill}
            </div>
          ) : transactionError ? (
            <div className="rounded-2xl border border-rose-200/20 bg-rose-500/10 p-6 text-sm text-rose-100">
              {transactionError}
            </div>
          ) : bills.length > 0 ? (
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