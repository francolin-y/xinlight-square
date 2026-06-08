"use client";

import { LoadingPortal } from "./LoadingPortal";

type PageShellProps = {
  title: string;
  intro: string;
  loadingTitle: string;
  loadingSubtitle: string;
  loadingVariant?: "cloud" | "magic" | "heart" | "market" | "studio" | "tree";
  loadingDurationMs?: number;
  children?: React.ReactNode;
};

export function PageShell({
  title,
  intro,
  loadingTitle,
  loadingSubtitle,
  loadingVariant = "cloud",
  loadingDurationMs = 1800,
  children,
}: PageShellProps) {
  return (
    <>
      <LoadingPortal
        title={loadingTitle}
        subtitle={loadingSubtitle}
        variant={loadingVariant}
        durationMs={loadingDurationMs}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <section className="relative overflow-hidden px-5 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.28),transparent_35%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-sky-200">
                Xinlight Square
              </p>

              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {title}
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                {intro}
              </p>
            </div>

            {children}
          </div>
        </section>
      </main>
    </>
  );
}