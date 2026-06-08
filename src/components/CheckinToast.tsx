"use client";

import { useEffect, useState } from "react";

type CheckinToastProps = {
  title: string;
  subtitle: string;
  delayMs?: number;
};

export function CheckinToast({
  title,
  subtitle,
  delayMs = 1900,
}: CheckinToastProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setVisible(true);
    }, delayMs);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, delayMs + 2200);

    const unmountTimer = window.setTimeout(() => {
      setMounted(false);
    }, delayMs + 3000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [delayMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={[
        "pointer-events-none fixed left-1/2 top-28 z-[90] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition-all duration-700",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0",
      ].join(" ")}
    >
      <div className="rounded-[2rem] border border-emerald-200/30 bg-slate-950/80 px-6 py-5 text-center text-white shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-200 text-xl text-slate-950">
          ✓
        </div>

        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-emerald-100">{subtitle}</p>
      </div>
    </div>
  );
}