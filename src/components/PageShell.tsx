"use client";

import { LoadingPortal } from "./LoadingPortal";

type LoadingVariant = "cloud" | "magic" | "heart" | "market" | "studio" | "tree";

type FontVariant = "plaza" | "magic" | "heart" | "market" | "studio" | "tree";

type BackgroundVariant = "default" | "plaza" | "magic" | "energy" | "studio";

type PageShellProps = {
  title: string;
  intro: string;
  loadingTitle: string;
  loadingSubtitle: string;
  loadingVariant?: LoadingVariant;
  loadingDurationMs?: number;
  backgroundVariant?: BackgroundVariant;
  fontVariant?: FontVariant;
  children?: React.ReactNode;
};

export function PageShell({
  title,
  intro,
  loadingTitle,
  loadingSubtitle,
  loadingVariant = "cloud",
  loadingDurationMs = 1800,
  backgroundVariant = "default",
  fontVariant = "plaza",
  children,
}: PageShellProps) {
  const isPlazaBackground = backgroundVariant === "plaza";
  const isMagicBackground = backgroundVariant === "magic";
  const isEnergyBackground = backgroundVariant === "energy";
  const isStudioBackground = backgroundVariant === "studio";
  const isMarketPage = fontVariant === "market";
  const isTreePage = fontVariant === "tree";

  const fontClass: Record<FontVariant, string> = {
    plaza: "font-plaza",
    magic: "font-magic",
    heart: "font-heart",
    market: "font-market",
    studio: "font-studio",
    tree: "font-tree",
  };

  const heroFrameClass = isPlazaBackground
    ? "rounded-[2rem] border border-white/20 bg-slate-950/20 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-[2px] md:p-8"
    : isMagicBackground
      ? "rounded-[2rem] border border-white/25 bg-white/5 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-[1px] ring-1 ring-white/10 md:p-8"
      : isEnergyBackground
        ? "rounded-[2rem] border border-white/20 bg-rose-950/20 p-6 shadow-2xl shadow-rose-950/25 backdrop-blur-[2px] ring-1 ring-white/10 md:p-8"
        : isStudioBackground
          ? "rounded-[2rem] border border-amber-100/15 bg-slate-950/45 p-6 shadow-2xl shadow-black/35 backdrop-blur-md ring-1 ring-amber-100/10 md:p-8"
          : isMarketPage
            ? "rounded-[2rem] border border-white/25 bg-white/5 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-[1px] ring-1 ring-white/10 md:p-8"
            : isTreePage
              ? "rounded-[2rem] border border-emerald-100/20 bg-emerald-950/25 p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-md ring-1 ring-white/10 md:p-8"
              : "";

  const eyebrowClass = isEnergyBackground
    ? "mb-4 text-sm uppercase tracking-[0.35em] text-pink-100 drop-shadow"
    : "mb-4 text-sm uppercase tracking-[0.35em] text-sky-200 drop-shadow";

  const introClass = isEnergyBackground
    ? "mt-6 text-lg leading-8 text-rose-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
    : "mt-6 text-lg leading-8 text-slate-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]";

  return (
    <>
      <LoadingPortal
        title={loadingTitle}
        subtitle={loadingSubtitle}
        variant={loadingVariant}
        fontVariant={fontVariant}
        durationMs={loadingDurationMs}
      />

      <main
        className={[
          "relative min-h-screen overflow-hidden text-white",
          fontClass[fontVariant],
          isPlazaBackground
            ? "bg-[url('/backgrounds/home_mobile_skyland.png')] bg-cover bg-center bg-no-repeat md:bg-[url('/backgrounds/home_desktop_skyland.png')]"
            : isMagicBackground
              ? "magic-page-background"
              : isStudioBackground
                ? "studio-page-background"
                : "bg-slate-950",
        ].join(" ")}
      >
        {isPlazaBackground ? (
          <>
            <div className="absolute inset-0 bg-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-slate-950/35" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_42%)]" />
          </>
        ) : isMagicBackground ? (
          <>
            <div className="fixed inset-0 z-[1] bg-slate-950/18" />
            <div className="fixed inset-0 z-[1] bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/60" />
            <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.08),transparent_46%)]" />
          </>
        ) : isEnergyBackground ? (
          <>
            <picture className="fixed inset-0 z-0 block">
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

            <div className="fixed inset-0 z-[1] bg-slate-950/25" />
            <div className="fixed inset-0 z-[1] bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/55" />
            <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.12),transparent_46%)]" />
          </>
        ) : isStudioBackground ? (
          <>
            <div className="fixed inset-0 z-[1] bg-slate-950/30" />
            <div className="fixed inset-0 z-[1] bg-gradient-to-b from-slate-950/30 via-slate-950/5 to-slate-950/70" />
            <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_48%)]" />
          </>  
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.28),transparent_35%)]" />
        )}

        <section className="relative z-10 min-h-screen px-5 py-16">
          <div className="mx-auto max-w-7xl">
            {(title || intro) && (
              <div className={["mb-10 max-w-3xl", heroFrameClass].join(" ")}>
                <p className={eyebrowClass}>Stella Planet</p>

                {title && (
                  <h1 className="text-4xl font-semibold tracking-tight drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] md:text-6xl">
                    {title}
                  </h1>
                )}

                {intro && <p className={introClass}>{intro}</p>}
              </div>
            )}

            {children}
          </div>
        </section>
      </main>
    </>
  );
}