"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/i18n";
import { useLanguage } from "./LanguageProvider";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-slate-950/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20">
            <span className="text-lg">✦</span>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.25em] text-white">
              STELLA
            </p>
            <p className="text-xs text-slate-300">{t.siteName}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {t.nav[item.key]}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setLang("cn")}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              lang === "cn" ? "bg-white text-slate-950" : "text-slate-300",
            ].join(" ")}
          >
            CN
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              lang === "en" ? "bg-white text-slate-950" : "text-slate-300",
            ].join(" ")}
          >
            EN
          </button>
        </div>
      </nav>

      <div className="flex gap-2 overflow-x-auto px-5 pb-4 lg:hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm transition",
                isActive
                  ? "bg-white text-slate-950"
                  : "bg-white/5 text-slate-300",
              ].join(" ")}
            >
              {t.nav[item.key]}
            </Link>
          );
        })}
      </div>
    </header>
  );
}