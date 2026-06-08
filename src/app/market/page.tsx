"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const marketCopies = {
  cn: {
    priceLabel: "价格",
    statusLabel: "状态",
    price: "1 星光值",
    redeem: "兑换",
    gifts: [
      {
        title: "一封手写信",
        type: "虚拟礼物",
        status: "未兑换",
      },
      {
        title: "一次夜晚散步计划",
        type: "一次约会",
        status: "未兑换",
      },
      {
        title: "神秘实物礼物",
        type: "实物",
        status: "已兑换未送达",
      },
    ],
  },
  en: {
    priceLabel: "Price",
    statusLabel: "Status",
    price: "1 starlight value",
    redeem: "Redeem",
    gifts: [
      {
        title: "A handwritten letter",
        type: "Virtual gift",
        status: "Available",
      },
      {
        title: "A night walk plan",
        type: "Date plan",
        status: "Available",
      },
      {
        title: "Mystery physical gift",
        type: "Physical gift",
        status: "Redeemed, not delivered",
      },
    ],
  },
};

export default function MarketPage() {
  const { lang, t } = useLanguage();
  const page = marketCopies[lang];

  return (
    <PageShell
      title={t.market.title}
      intro={t.market.intro}
      loadingTitle={t.market.loadingTitle}
      loadingSubtitle={t.market.loadingSubtitle}
      loadingVariant="market"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {page.gifts.map((gift) => (
          <article
            key={gift.title}
            className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur"
          >
            <div className="mb-5 h-40 rounded-3xl bg-gradient-to-br from-white/20 to-white/5" />

            <h2 className="text-2xl font-semibold">{gift.title}</h2>
            <p className="mt-3 text-sm text-slate-300">{gift.type}</p>
            <p className="mt-3 text-sm text-amber-200">
              {page.priceLabel}: {page.price}
            </p>
            <p className="mt-3 text-sm text-sky-200">
              {page.statusLabel}: {gift.status}
            </p>

            <button
              type="button"
              className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
            >
              {page.redeem}
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}