"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const marketCopies = {
  cn: {
    priceLabel: "价格",
    statusLabel: "状态",
    price: "1 星光值",
    redeem: "兑换",
    redeemed: "已兑换",
    available: "可兑换",
    shelfTitle: "今日快乐货架",
    shelfIntro: "每一份礼物都可以用积攒的星光值兑换。",
    gifts: [
      {
        id: 1,
        title: "一封手写信",
        type: "虚拟礼物",
        status: "available",
        icon: "✉",
        description: "兑换后，会收到一封只写给你的手写信。",
      },
      {
        id: 2,
        title: "一次夜晚散步计划",
        type: "一次约会",
        status: "available",
        icon: "☾",
        description: "兑换后，解锁一份适合夜晚一起执行的散步计划。",
      },
      {
        id: 3,
        title: "神秘实物礼物",
        type: "实物",
        status: "redeemed",
        icon: "◆",
        description: "已经兑换，正在等待送达。",
      },
    ],
  },
  en: {
    priceLabel: "Price",
    statusLabel: "Status",
    price: "1 starlight value",
    redeem: "Redeem",
    redeemed: "Redeemed",
    available: "Available",
    shelfTitle: "Today’s Happiness Shelf",
    shelfIntro: "Each gift can be redeemed with the starlight value you have collected.",
    gifts: [
      {
        id: 1,
        title: "A handwritten letter",
        type: "Virtual gift",
        status: "available",
        icon: "✉",
        description: "Redeem this to receive a handwritten letter made only for you.",
      },
      {
        id: 2,
        title: "A night walk plan",
        type: "Date plan",
        status: "available",
        icon: "☾",
        description: "Redeem this to unlock a small night-walk plan to follow together.",
      },
      {
        id: 3,
        title: "Mystery physical gift",
        type: "Physical gift",
        status: "redeemed",
        icon: "◆",
        description: "Already redeemed and waiting to be delivered.",
      },
    ],
  },
};

const marketBackgrounds = {
  desktop: "/backgrounds/market/market-main-desktop.png",
  mobile: "/backgrounds/market/market-main-mobile.png",
};

type GiftStatus = "available" | "redeemed";

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
      fontVariant="market"
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="hidden h-full w-full bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: `url(${marketBackgrounds.desktop})` }}
        />
        <div
          className="block h-full w-full bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: `url(${marketBackgrounds.mobile})` }}
        />
        <div className="absolute inset-0 bg-amber-950/20" />
      </div>

      <div className="relative z-10">
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-amber-200/10 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-100">
                Market
              </p>
              <h2 className="mt-3 font-market-accent text-3xl font-semibold">
                {page.shelfTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                {page.shelfIntro}
              </p>
            </div>

            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg">
              1314 ✦
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          {page.gifts.map((gift) => {
            const status = gift.status as GiftStatus;
            const isRedeemed = status === "redeemed";

            return (
              <article
                key={gift.id}
                className={[
                  "group relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl backdrop-blur-md transition duration-300",
                  isRedeemed
                    ? "border-white/10 bg-white/5 opacity-75"
                    : "border-white/15 bg-white/10 hover:-translate-y-1 hover:bg-white/15",
                ].join(" ")}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-200/20 blur-3xl transition group-hover:bg-amber-200/30" />
                <div className="pointer-events-none absolute -bottom-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-pink-300/15 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 grid h-44 place-items-center rounded-3xl border border-white/15 bg-gradient-to-br from-white/25 to-white/5 shadow-inner">
                    <div
                      className={[
                        "grid h-24 w-24 place-items-center rounded-[2rem] text-5xl shadow-2xl ring-1 transition duration-300",
                        isRedeemed
                          ? "bg-slate-950/40 text-white/40 ring-white/10"
                          : "bg-white text-amber-600 ring-white/50 group-hover:scale-105",
                      ].join(" ")}
                    >
                      {gift.icon}
                    </div>
                  </div>

                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{gift.title}</h2>
                      <p className="mt-2 text-sm text-slate-300">{gift.type}</p>
                    </div>

                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs ring-1",
                        isRedeemed
                          ? "bg-white/10 text-white/50 ring-white/10"
                          : "bg-amber-200/15 text-amber-100 ring-amber-200/25",
                      ].join(" ")}
                    >
                      {isRedeemed ? page.redeemed : page.available}
                    </span>
                  </div>

                  <p className="min-h-12 text-sm leading-6 text-slate-200">
                    {gift.description}
                  </p>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-300">{page.priceLabel}</span>
                      <span className="font-market-accent font-semibold text-amber-200">
                        {page.price}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-300">{page.statusLabel}</span>
                      <span className={isRedeemed ? "text-white/50" : "text-sky-200"}>
                        {isRedeemed ? page.redeemed : page.available}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isRedeemed}
                    className={[
                      "mt-6 w-full rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed",
                      isRedeemed
                        ? "bg-white/10 text-white/40"
                        : "bg-white text-slate-950 hover:bg-amber-100",
                    ].join(" ")}
                  >
                    {isRedeemed ? page.redeemed : page.redeem}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}