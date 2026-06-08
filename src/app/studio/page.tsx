"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const studioCopies = {
  cn: {
    unlocked: "已解锁",
    memories: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `记忆切片 ${index + 1}`,
    })),
  },
  en: {
    unlocked: "Unlocked",
    memories: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `Memory Slice ${index + 1}`,
    })),
  },
};

export default function StudioPage() {
  const { lang, t } = useLanguage();
  const page = studioCopies[lang];

  return (
    <PageShell
      title={t.studio.title}
      intro={t.studio.intro}
      loadingTitle={t.studio.loadingTitle}
      loadingSubtitle={t.studio.loadingSubtitle}
      loadingVariant="studio"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {page.memories.map((memory) => (
          <article
            key={memory.id}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur"
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-sky-200/30 via-violet-300/20 to-white/10" />
            <div className="p-4">
              <h2 className="font-medium">{memory.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{page.unlocked}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}