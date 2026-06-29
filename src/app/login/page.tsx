"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

type Profile = {
  id: string;
  display_name: string | null;
  role: ProfileRole;
  subscription_started_at: string | null;
};

const loginCopies = {
  cn: {
    checking: "正在检查登录状态……",
    signedOut: "当前未登录。",
    readUserError: "读取登录状态失败",
    profileReadError: "已登录，但读取身份失败",
    profileNotFound: "Profile not found",
    loggedIn: "已登录",
    fillEmailPassword: "请填写邮箱和密码。",
    signingIn: "正在登录……",
    loginFailed: "登录失败",
    loginSuccessNoProfile: "登录成功，但暂时无法读取身份。请刷新页面后重试。",
    guestEntering: "正在以访客身份进入……",
    guestFailed: "进入访客模式失败",
    guestRedirect: "正在进入天空广场……",
    title: "进入Stella星球",
    emailLabel: "邮箱",
    emailPlaceholder: "you@example.com",
    passwordLabel: "密码",
    passwordPlaceholder: "请输入密码",
    loginButton: "登录",
    loggingInButton: "正在登录……",
    guestButton: "以访客身份浏览",
    guestEnteringButton: "正在进入……",
  },
  en: {
    checking: "Checking login status...",
    signedOut: "You are not signed in.",
    readUserError: "Failed to read login status",
    profileReadError: "Signed in, but failed to read profile",
    profileNotFound: "Profile not found",
    loggedIn: "Signed in",
    fillEmailPassword: "Please enter both email and password.",
    signingIn: "Signing in...",
    loginFailed: "Sign-in failed",
    loginSuccessNoProfile:
      "Signed in, but the profile could not be loaded yet. Please refresh and try again.",
    guestEntering: "Entering as a guest...",
    guestFailed: "Failed to enter guest mode",
    guestRedirect: "Entering Stella Planet...",
    title: "Enter Stella Planet",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Log in",
    loggingInButton: "Signing in...",
    guestButton: "Browse as guest",
    guestEnteringButton: "Entering...",
  },
};

function getRoleRedirectPath(role: ProfileRole) {
  if (role === "admin") return "/admin";

  return "/plaza";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { lang, setLang } = useLanguage();
  const page = loginCopies[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState(page.checking);
  const [isChecking, setIsChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isEnteringGuest, setIsEnteringGuest] = useState(false);

  async function loadCurrentUser() {
    setIsChecking(true);
    setStatus(page.checking);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setStatus(`${page.readUserError}：${userError.message}`);
      setIsChecking(false);
      return null;
    }

    if (!user) {
      setStatus(page.signedOut);
      setIsChecking(false);
      return null;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, role, subscription_started_at")
      .eq("id", user.id)
      .single();

    if (profileError || !data) {
      setStatus(
        `${page.profileReadError}：${
          profileError?.message ?? page.profileNotFound
        }`,
      );
      setIsChecking(false);
      return null;
    }

    const nextProfile = data as Profile;

    setStatus(`${page.loggedIn}：${user.email ?? ""}`);
    setIsChecking(false);

    return nextProfile;
  }

  async function handleSignIn() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus(page.fillEmailPassword);
      return;
    }

    setIsSigningIn(true);
    setStatus(page.signingIn);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      setStatus(`${page.loginFailed}：${error.message}`);
      setIsSigningIn(false);
      return;
    }

    const nextProfile = await loadCurrentUser();

    setIsSigningIn(false);

    if (!nextProfile) {
      setStatus(page.loginSuccessNoProfile);
      return;
    }

    router.push(getRoleRedirectPath(nextProfile.role));
  }

  async function handleVisitAsGuest() {
    setIsEnteringGuest(true);
    setStatus(page.guestEntering);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setStatus(`${page.guestFailed}：${error.message}`);
        setIsEnteringGuest(false);
        return;
      }
    }

    setPassword("");
    setStatus(page.guestRedirect);
    router.push("/plaza");
  }

  useEffect(() => {
    void loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[url('/backgrounds/login/login-background-mobile.png')] bg-cover bg-center md:bg-[url('/backgrounds/login/login-background-desktop.png')]" />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/20" />

      <div className="relative z-10 mx-auto mb-4 flex max-w-xs justify-end">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setLang("cn")}
            className={[
              "rounded-full px-2 py-0.5 text-[10px] transition",
              lang === "cn" ? "bg-white text-slate-950" : "text-white/70",
            ].join(" ")}
          >
            CN
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={[
              "rounded-full px-2.5 py-1 text-xs transition",
              lang === "en" ? "bg-white text-slate-950" : "text-white/70",
            ].join(" ")}
          >
            EN
          </button>
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-xs rounded-[1.25rem] border border-white/5 bg-white/[0.04] p-4 shadow-lg shadow-black/10 backdrop-blur-[2px] md:p-4">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
          {page.title}
        </h1>

        <div className="mt-4 grid gap-2.5">
          <label className="grid gap-1.5">
            <span className="text-[11px] text-white/65">{page.emailLabel}</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={page.emailPlaceholder}
              autoComplete="email"
              disabled={isSigningIn || isEnteringGuest}
              className="rounded-xl border border-white/10 bg-slate-950/20 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-sky-200/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs text-white/75">{page.passwordLabel}</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder={page.passwordPlaceholder}
              autoComplete="current-password"
              disabled={isSigningIn || isEnteringGuest}
              className="rounded-xl border border-white/10 bg-slate-950/20 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-sky-200/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-2.5">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn || isEnteringGuest}
            className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningIn ? page.loggingInButton : page.loginButton}
          </button>

          <button
            type="button"
            onClick={() => void handleVisitAsGuest()}
            disabled={isSigningIn || isEnteringGuest}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnteringGuest ? page.guestEnteringButton : page.guestButton}
          </button>
        </div>

        <p className="mt-4 min-h-5 text-center text-xs leading-5 text-white/65">
          {isChecking ? page.checking : status}
        </p>
      </section>
    </main>
  );
}