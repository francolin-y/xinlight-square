"use client";

import { useEffect, useState } from "react";

type LoadingVariant = "cloud" | "magic" | "heart" | "market" | "studio" | "tree";

type LoadingPortalProps = {
  title: string;
  subtitle: string;
  variant?: LoadingVariant;
  durationMs?: number;
};

export function LoadingPortal({
  title,
  subtitle,
  variant = "cloud",
  durationMs = 1800,
}: LoadingPortalProps) {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [title, subtitle];

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
    cloud: "from-sky-200 via-indigo-200 to-violet-300",
    magic: "from-violet-950 via-fuchsia-800 to-indigo-950",
    heart: "from-rose-300 via-pink-400 to-purple-600",
    market: "from-amber-200 via-orange-300 to-pink-400",
    studio: "from-cyan-200 via-blue-400 to-indigo-700",
    tree: "from-emerald-200 via-teal-400 to-slate-800",
  };

  const icon: Record<LoadingVariant, string> = {
    cloud: "☁",
    magic: "✦",
    heart: "♡",
    market: "✧",
    studio: "▣",
    tree: "葉",
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-to-br transition-opacity duration-500",
        variantClass[variant],
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <PortalAtmosphere variant={variant} />

      <div className="pointer-events-none absolute inset-0 bg-white/10" />

      <div className="relative z-10 px-6 text-center text-white">
        <div className="mx-auto mb-8 grid h-20 w-20 animate-portal-pulse place-items-center rounded-full bg-white/20 text-3xl shadow-[0_0_48px_rgba(255,255,255,0.45)] ring-1 ring-white/40 backdrop-blur-md">
          {icon[variant]}
        </div>

        <div className="relative h-24 overflow-hidden">
          <h1
            key={loadingTexts[textIndex]}
            className="animate-loading-text text-3xl font-semibold tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] md:text-5xl"
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
    return (
      <>
        <div className="portal-sun-glow" />
        <div className="portal-cloud portal-cloud-1" />
        <div className="portal-cloud portal-cloud-2" />
        <div className="portal-cloud portal-cloud-3" />
        <div className="portal-cloud portal-cloud-4" />
        <div className="portal-light-beam" />
      </>
    );
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