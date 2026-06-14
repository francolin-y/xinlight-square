"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const studioCopies = {
  cn: {
    unlocked: "已解锁",
    locked: "未解锁",
    workshopTitle: "记忆切片陈列台",
    workshopIntro: "这里会存放照片、视频、语音和只属于你们的小片段。",
    totalSlices: "切片数量",
    unlockedSlices: "已显影",
    types: ["照片", "视频", "语音", "文字"],
    memories: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `记忆切片 ${index + 1}`,
      type: ["照片", "视频", "语音", "文字"][index % 4],
      status: index < 6 ? "unlocked" : "locked",
    })),
  },
  en: {
    unlocked: "Unlocked",
    locked: "Locked",
    workshopTitle: "Memory Slice Display",
    workshopIntro: "Photos, videos, voice notes, and small private fragments will be stored here.",
    totalSlices: "Total slices",
    unlockedSlices: "Developed",
    types: ["Photo", "Video", "Voice", "Text"],
    memories: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `Memory Slice ${index + 1}`,
      type: ["Photo", "Video", "Voice", "Text"][index % 4],
      status: index < 6 ? "unlocked" : "locked",
    })),
  },
};

type MemoryStatus = "unlocked" | "locked";

export default function StudioPage() {
  const { lang, t } = useLanguage();
  const page = studioCopies[lang];

  const unlockedCount = page.memories.filter(
    (memory) => memory.status === "unlocked",
  ).length;

  return (
    <PageShell
      title={t.studio.title}
      intro={t.studio.intro}
      loadingTitle={t.studio.loadingTitle}
      loadingSubtitle={t.studio.loadingSubtitle}
      loadingVariant="studio"
      backgroundVariant="studio"
      fontVariant="studio"
    >
      <section className="mb-6 rounded-[2rem] border border-white/10 bg-cyan-200/10 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-100">
              Studio
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {page.workshopTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              {page.workshopIntro}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">{page.totalSlices}</p>
              <p className="mt-2 text-3xl font-semibold">
                {page.memories.length}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">{page.unlockedSlices}</p>
              <p className="mt-2 text-3xl font-semibold">{unlockedCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {page.memories.map((memory) => {
          const status = memory.status as MemoryStatus;
          const isLocked = status === "locked";

          return (
            <article
              key={memory.id}
              className={[
                "group overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-md transition duration-300",
                isLocked
                  ? "border-white/5 bg-white/5 opacity-60"
                  : "border-white/10 bg-white/10 hover:-translate-y-1 hover:bg-white/15",
              ].join(" ")}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-sky-200/30 via-violet-300/20 to-white/10">
                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span className="rounded-full bg-slate-950/45 px-3 py-1 text-xs text-white/80 backdrop-blur">
                    #{String(memory.id).padStart(2, "0")}
                  </span>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs backdrop-blur",
                      isLocked
                        ? "bg-white/10 text-white/50"
                        : "bg-cyan-100/90 text-slate-950",
                    ].join(" ")}
                  >
                    {isLocked ? page.locked : page.unlocked}
                  </span>
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_0_8%,transparent_8%_18%)] bg-[length:36px_100%] opacity-35" />

                <div className="absolute inset-0 grid place-items-center">
                  <div
                    className={[
                      "grid h-24 w-24 place-items-center rounded-[2rem] text-4xl shadow-2xl ring-1 transition duration-300",
                      isLocked
                        ? "bg-slate-950/40 text-white/35 ring-white/10"
                        : "bg-white/85 text-sky-700 ring-white/60 group-hover:scale-105",
                    ].join(" ")}
                  >
                    {isLocked ? "▣" : getMemoryIcon(memory.type)}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="font-medium">{memory.title}</h2>
                  <span className="text-xs text-cyan-100">{memory.type}</span>
                </div>

                <p
                  className={[
                    "text-sm",
                    isLocked ? "text-slate-500" : "text-slate-300",
                  ].join(" ")}
                >
                  {isLocked ? page.locked : page.unlocked}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

function getMemoryIcon(type: string) {
  if (type === "照片" || type === "Photo") return "◒";
  if (type === "视频" || type === "Video") return "▶";
  if (type === "语音" || type === "Voice") return "≈";
  return "✎";
}