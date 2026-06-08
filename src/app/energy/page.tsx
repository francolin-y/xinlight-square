"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const energyCopies = {
  cn: {
    sourceTitle: "星光值来源",
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

  return (
    <PageShell
      title={t.energy.title}
      intro={t.energy.intro}
      loadingTitle={t.energy.loadingTitle}
      loadingSubtitle={t.energy.loadingSubtitle}
      loadingVariant="heart"
    >
      <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
        <h2 className="mb-5 text-2xl font-semibold">{page.sourceTitle}</h2>

        <div className="grid gap-3">
          {page.sources.map(([label, amount]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl bg-slate-950/60 px-5 py-4"
            >
              <span>{label}</span>
              <span className="font-semibold text-sky-200">{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}