"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/i18n";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "./LanguageProvider";

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);

  const [role, setRole] = useState<ProfileRole | null>(null);

  useEffect(() => {
    async function loadCurrentRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        setRole(null);
        return;
      }

      setRole(profile.role as ProfileRole);
    }

    void loadCurrentRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadCurrentRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isAdmin = role === "admin";
  const isAdminActive = pathname.startsWith("/admin");
  const adminLabel = lang === "cn" ? "站长后台" : "Admin";

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
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

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

          {isAdmin ? (
            <Link
              href="/admin"
              className={[
                "rounded-full px-4 py-2 text-sm transition",
                isAdminActive
                  ? "bg-amber-100 text-slate-950"
                  : "text-amber-100 hover:bg-amber-100/15 hover:text-amber-50",
              ].join(" ")}
            >
              {adminLabel}
            </Link>
          ) : null}
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

        {isAdmin ? (
          <Link
            href="/admin"
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm transition",
              isAdminActive
                ? "bg-amber-100 text-slate-950"
                : "bg-amber-100/10 text-amber-100",
            ].join(" ")}
          >
            {adminLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
}