"use client";

import { useEffect, useState } from "react";

type LoadingPortalProps = {
  title: string;
  subtitle: string;
  variant?: "cloud" | "magic" | "heart" | "market" | "studio" | "tree";
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
      setTextIndex((current) => (current + 1) % 2);
    }, 650);

    const fadeTimer = window.setTimeout(() => {
      setVisible(false);
    }, durationMs - 400);

    const unmountTimer = window.setTimeout(() => {
      setMounted(false);
    }, durationMs);

    return () => {
      window.clearInterval(textTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [durationMs]);

  if (!mounted) {
    return null;
  }

  const variantClass = {
    cloud: "from-sky-300 via-indigo-300 to-violet-500",
    magic: "from-violet-900 via-fuchsia-700 to-indigo-950",
    heart: "from-rose-300 via-pink-400 to-purple-600",
    market: "from-amber-200 via-orange-300 to-pink-400",
    studio: "from-cyan-200 via-blue-400 to-indigo-700",
    tree: "from-emerald-200 via-teal-400 to-slate-800",
  }[variant];

  return (
    <div
      className={[
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-to-br transition-opacity duration-500",
        variantClass,
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-20 h-56 w-56 animate-pulse rounded-full bg-white blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 animate-pulse rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 animate-pulse rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative px-6 text-center text-white">
        <div className="mx-auto mb-8 grid h-20 w-20 animate-pulse place-items-center rounded-full bg-white/20 text-3xl ring-1 ring-white/40">
          ✦
        </div>

        <div className="relative h-24 overflow-hidden">
          <h1
            key={loadingTexts[textIndex]}
            className="animate-loading-text text-3xl font-semibold tracking-wide md:text-5xl"
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
                index === textIndex ? "w-6 bg-white" : "bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}