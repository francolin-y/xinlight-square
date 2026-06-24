"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/data/i18n";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "./LanguageProvider";

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

type CurrentProfile = {
  display_name: string | null;
  role: ProfileRole;
};

function getRoleLabel(role: ProfileRole, lang: "cn" | "en") {
  if (lang === "en") {
    if (role === "admin") return "Admin";
    if (role === "heroine") return "Heroine";
    if (role === "fan") return "Fan";
    return "Guest";
  }

  if (role === "admin") return "站长";
  if (role === "heroine") return "女主人公";
  if (role === "fan") return "粉丝";
  return "访客";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function loadCurrentProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setIsAuthLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      setProfile(null);
      setIsAuthLoaded(true);
      return;
    }

    setProfile(data as CurrentProfile);
    setIsAuthLoaded(true);
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      return;
    }

    setProfile(null);
    setIsSigningOut(false);
    router.push("/login");
  }

  useEffect(() => {
    void loadCurrentProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadCurrentProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const isAdmin = profile?.role === "admin";
  const isAdminActive = pathname.startsWith("/admin");
  const isLoginActive = pathname.startsWith("/login");
  const adminLabel = lang === "cn" ? "站长后台" : "Admin";
  const loginLabel = lang === "cn" ? "登录" : "Login";
  const logoutLabel = lang === "cn" ? "退出" : "Logout";

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

          {isAuthLoaded && !profile ? (
            <Link
              href="/login"
              className={[
                "rounded-full px-4 py-2 text-sm transition",
                isLoginActive
                  ? "bg-sky-200 text-slate-950"
                  : "text-sky-100 hover:bg-sky-100/15 hover:text-white",
              ].join(" ")}
            >
              {loginLabel}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-100/10 px-3 py-2 text-xs text-emerald-100 md:flex">
              <span>{getRoleLabel(profile.role, lang)}</span>
              {profile.display_name ? (
                <span className="text-emerald-100/60">
                  · {profile.display_name}
                </span>
              ) : null}
            </div>
          ) : null}

          {profile ? (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningOut ? "..." : logoutLabel}
            </button>
          ) : null}

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

        {isAuthLoaded && !profile ? (
          <Link
            href="/login"
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm transition",
              isLoginActive
                ? "bg-sky-200 text-slate-950"
                : "bg-sky-100/10 text-sky-100",
            ].join(" ")}
          >
            {loginLabel}
          </Link>
        ) : null}

        {profile ? (
          <div className="shrink-0 rounded-full border border-emerald-200/20 bg-emerald-100/10 px-4 py-2 text-sm text-emerald-100">
            {getRoleLabel(profile.role, lang)}
          </div>
        ) : null}
      </div>
    </header>
  );
}