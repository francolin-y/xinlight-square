"use client";

import { useEffect, useState } from "react";

type LoadingVariant = "cloud" | "magic" | "heart" | "market" | "studio" | "tree";

type FontVariant = "plaza" | "magic" | "heart" | "market" | "studio" | "tree";

type LoadingPortalProps = {
  title: string;
  subtitle: string;
  variant?: LoadingVariant;
  fontVariant?: FontVariant;
  durationMs?: number;
};

export function LoadingPortal({
  title,
  subtitle,
  variant = "cloud",
  fontVariant = "plaza",
  durationMs = 1800,
}: LoadingPortalProps) {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [title, subtitle];
  const isCloudLoading = variant === "cloud";
  const isMagicLoading = variant === "magic";
  const isHeartLoading = variant === "heart";
  const isMarketLoading = variant === "market";
  const isStudioLoading = variant === "studio";
  const isTreeLoading = variant === "tree";

  useEffect(() => {
    const textTimer = window.setInterval(() => {
      setTextIndex((current) => (current + 1) % loadingTexts.length);
    }, 650);

    const fadeTimer = window.setTimeout(() => {
      setVisible(false);
    }, Math.max(durationMs - 400, 0));

    const unmountTimer = window.setTimeout(() => {
      setMounted(false);
    }, durationMs);

    return () => {
      window.clearInterval(textTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [durationMs, loadingTexts.length]);

  if (!mounted) {
    return null;
  }

  const variantClass: Record<LoadingVariant, string> = {
    cloud: "from-sky-100 via-sky-200 to-blue-300",
    magic: "from-violet-950 via-fuchsia-800 to-indigo-950",
    heart: "from-rose-300 via-pink-400 to-purple-600",
    market: "from-amber-200 via-orange-300 to-pink-400",
    studio: "from-cyan-200 via-blue-400 to-indigo-700",
    tree: "from-emerald-200 via-teal-400 to-slate-800",
  };

  const fontClass: Record<FontVariant, string> = {
  plaza: "font-plaza",
  magic: "font-magic",
  heart: "font-heart",
  market: "font-market",
  studio: "font-studio",
  tree: "font-tree",
  };

  const icon: Record<LoadingVariant, string> = {
    cloud: "☁️",
    magic: "🔮",
    heart: "💗",
    market: "🌟",
    studio: "🚪",
    tree: "🍃",
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-to-br transition-opacity duration-500",
        variantClass[variant],
        fontClass[fontVariant],
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      
      {isCloudLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/home-cloud-desktop.png"
            />
            <img
              src="/backgrounds/loading/home-cloud-mobile.png"
              alt=""
              aria-hidden="true"
              className="loading-cloud-image"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-white/10" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/20 via-sky-100/10 to-blue-950/20" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.22),transparent_38%)]" />
          <div className="loading-cloud-center-glow" />
          <div className="loading-cloud-light-drift" />
        </>
      ) : isMagicLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/magic-circle-desktop.png"
            />
            <img
              src="/backgrounds/loading/magic-circle-mobile.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-slate-950/20" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-violet-950/20 via-slate-950/10 to-slate-950/55" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_36%)]" />
          <div className="loading-magic-center-glow" />
          <div className="loading-magic-vignette" />

          <div className="relative z-[2]">
            <PortalAtmosphere variant={variant} />
          </div>
        </>
      ) : isHeartLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/energy-heart-desktop.png"
            />
            <img
              src="/backgrounds/loading/energy-heart-mobile.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-rose-950/10" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-rose-950/10 via-transparent to-slate-950/35" />
        </>
      ) : isMarketLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/market-rainbow-desktop.png"
            />
            <img
              src="/backgrounds/loading/market-rainbow-mobile.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-amber-950/10" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/5 via-transparent to-amber-950/35" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_42%)]" />
        </>
      ) : isStudioLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/studio-loading-desktop.png"
            />
            <img
              src="/backgrounds/loading/studio-loading-mobile.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-slate-950/20" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/25 via-slate-950/5 to-slate-950/55" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_44%)]" />

          <div className="relative z-[2]">
            <PortalAtmosphere variant={variant} />
          </div>
        </>
      ) : isTreeLoading ? (
        <>
          <picture className="absolute inset-0 z-0">
            <source
              media="(min-width: 768px)"
              srcSet="/backgrounds/loading/tree-loading-desktop.png"
            />
            <img
              src="/backgrounds/loading/tree-loading-mobile.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div className="absolute inset-0 z-[1] bg-emerald-950/20" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-emerald-950/10 via-slate-950/10 to-slate-950/60" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(187,247,208,0.12),transparent_44%)]" />

          <div className="relative z-[2]">
            <PortalAtmosphere variant={variant} />
          </div>
        </>    
      ) : (
        <>
          <PortalAtmosphere variant={variant} />
          <div className="pointer-events-none absolute inset-0 bg-white/10" />
        </>
      )}

      <div className="relative z-10 px-6 text-center text-white">
        {!isHeartLoading && !isMarketLoading && (
          <div
            className={[
              "mx-auto mb-8 grid h-20 w-20 animate-portal-pulse place-items-center rounded-full text-3xl ring-1 backdrop-blur-md",
              isCloudLoading
                ? "bg-white/30 text-white shadow-[0_0_56px_rgba(255,255,255,0.58)] ring-white/50"
                : isMagicLoading
                  ? "bg-violet-100/20 text-white shadow-[0_0_64px_rgba(216,180,254,0.72)] ring-violet-100/45"
                  : "bg-white/20 shadow-[0_0_48px_rgba(255,255,255,0.45)] ring-white/40",
            ].join(" ")}
          >
            {icon[variant]}
          </div>
        )}

        <div className="relative h-24 overflow-hidden">
          <h1
            key={loadingTexts[textIndex]}
            className={[
              "animate-loading-text text-3xl font-semibold tracking-wide md:text-5xl",
              isCloudLoading
                ? "drop-shadow-[0_3px_20px_rgba(15,23,42,0.55)]"
                : isMagicLoading
                  ? "drop-shadow-[0_2px_12px_rgba(76,29,149,0.75)]"
                  : "drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
            ].join(" ")}
          >
            {loadingTexts[textIndex]}
          </h1>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {loadingTexts.map((text, index) => (
            <span
              key={text}
              className={[
                "h-2 w-2 rounded-full transition-all duration-300",
                index === textIndex
                  ? "w-6 bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                  : "bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PortalAtmosphere({ variant }: { variant: LoadingVariant }) {
  if (variant === "cloud") {
    return null;
  }

  if (variant === "magic") {
    return (
      <>
        <div className="portal-orb-glow" />
        <div className="portal-magic-ring portal-magic-ring-1" />
        <div className="portal-magic-ring portal-magic-ring-2" />
        <div className="portal-sparkles" />
      </>
    );
  }

  if (variant === "heart") {
    return (
      <>
        <div className="portal-orb-glow" />
        <div className="portal-floating-dot portal-floating-dot-1">♡</div>
        <div className="portal-floating-dot portal-floating-dot-2">♡</div>
        <div className="portal-floating-dot portal-floating-dot-3">♡</div>
        <div className="portal-floating-dot portal-floating-dot-4">♡</div>
      </>
    );
  }

  if (variant === "market") {
    return (
      <>
        <div className="portal-orb-glow" />
        <div className="portal-floating-dot portal-floating-dot-1">✦</div>
        <div className="portal-floating-dot portal-floating-dot-2">✧</div>
        <div className="portal-floating-dot portal-floating-dot-3">◆</div>
        <div className="portal-floating-dot portal-floating-dot-4">✦</div>
      </>
    );
  }

  if (variant === "studio") {
    return (
      <>
        <div className="portal-orb-glow" />
        <div className="portal-film-strip portal-film-strip-1" />
        <div className="portal-film-strip portal-film-strip-2" />
        <div className="portal-film-strip portal-film-strip-3" />
      </>
    );
  }

  return (
    <>
      <div className="portal-orb-glow" />
      <div className="portal-leaf portal-leaf-1">✦</div>
      <div className="portal-leaf portal-leaf-2">✦</div>
      <div className="portal-leaf portal-leaf-3">✦</div>
      <div className="portal-leaf portal-leaf-4">✦</div>
    </>
  );
}