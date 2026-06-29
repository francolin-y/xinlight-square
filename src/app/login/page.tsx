"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

type Profile = {
  id: string;
  display_name: string | null;
  role: ProfileRole;
  subscription_started_at: string | null;
};

function getRoleLabel(role: ProfileRole) {
  if (role === "admin") return "站长";
  if (role === "heroine") return "女主人公";
  if (role === "fan") return "粉丝";
  return "访客";
}

function getRoleRedirectPath(role: ProfileRole) {
  if (role === "admin") return "/admin";

  return "/plaza";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("正在检查当前登录状态……");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEnteringGuest, setIsEnteringGuest] = useState(false);

  async function loadCurrentUser() {
    setIsChecking(true);
    setStatus("正在检查当前登录状态……");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setStatus(`读取登录状态失败：${userError.message}`);
      setProfile(null);
      setCurrentEmail(null);
      setIsChecking(false);
      return null;
    }

    if (!user) {
      setStatus("当前未登录。");
      setProfile(null);
      setCurrentEmail(null);
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
        `已登录，但读取身份失败：${
          profileError?.message ?? "Profile not found"
        }`,
      );
      setProfile(null);
      setCurrentEmail(user.email ?? null);
      setIsChecking(false);
      return null;
    }

    const nextProfile = data as Profile;

    setProfile(nextProfile);
    setCurrentEmail(user.email ?? null);
    setStatus(`已登录：${user.email ?? "未知邮箱"}`);
    setIsChecking(false);

    return nextProfile;
  }

  async function handleSignIn() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus("请填写邮箱和密码。");
      return;
    }

    setIsSigningIn(true);
    setStatus("正在登录……");

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      setStatus(`登录失败：${error.message}`);
      setIsSigningIn(false);
      return;
    }

    const nextProfile = await loadCurrentUser();

    setIsSigningIn(false);

    if (!nextProfile) {
      setStatus("登录成功，但暂时无法读取身份。请刷新页面后重试。");
      return;
    }

    setStatus(`登录成功，正在进入${getRoleLabel(nextProfile.role)}入口……`);
    router.push(getRoleRedirectPath(nextProfile.role));
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setStatus("正在退出登录……");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(`退出失败：${error.message}`);
      setIsSigningOut(false);
      return;
    }

    setProfile(null);
    setCurrentEmail(null);
    setPassword("");
    setStatus("已退出登录。");
    setIsSigningOut(false);
  }

  function handleEnterCurrentRolePage() {
    if (!profile) return;

    router.push(getRoleRedirectPath(profile.role));
  }

  async function handleVisitAsGuest() {
    setIsEnteringGuest(true);
    setStatus("正在以访客身份进入……");

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        const { error } = await supabase.auth.signOut();

        if (error) {
        setStatus(`进入访客模式失败：${error.message}`);
        setIsEnteringGuest(false);
        return;
        }
    }

    setProfile(null);
    setCurrentEmail(null);
    setPassword("");
    setStatus("正在进入天空广场……");
    setIsEnteringGuest(false);
    router.push("/");
  }

  useEffect(() => {
    void loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-20 text-white">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-200">
          Account Gate
        </p>

        <h1 className="mt-4 text-3xl font-semibold">进入星光系统</h1>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          登录后会根据当前身份进入对应入口。站长会进入后台，女主人公会回到星光广场。也可以以访客身份进入，浏览已经公开的星光内容。
        </p>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">邮箱</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSigningIn || isSigningOut || isEnteringGuest}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-200/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">密码</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="请输入密码"
              autoComplete="current-password"
              disabled={isSigningIn || isSigningOut || isEnteringGuest}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-200/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
            <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn || isSigningOut || isEnteringGuest}
                className="rounded-full bg-sky-200 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSigningIn ? "正在登录……" : "登录"}
            </button>

            <button
                type="button"
                onClick={() => void handleVisitAsGuest()}
                disabled={isSigningIn || isSigningOut || isEnteringGuest}
                className="rounded-full border border-sky-200/30 bg-sky-100/10 px-5 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-100/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isEnteringGuest ? "正在进入……" : "Visit as guest"}
            </button>

            {profile ? (
                <button
                type="button"
                onClick={handleEnterCurrentRolePage}
                disabled={isSigningIn || isSigningOut || isEnteringGuest}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {profile.role === "admin" ? "进入站长后台" : "进入星光广场"}
                </button>
            ) : null}

            {profile ? (
                <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningIn || isSigningOut || isEnteringGuest}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {isSigningOut ? "正在退出……" : "退出登录"}
                </button>
            ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">状态</p>
          <p className="mt-2 leading-7 text-slate-100">
            {isChecking ? "正在检查当前登录状态……" : status}
          </p>
        </div>

        {profile ? (
          <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
            <p className="text-sm text-emerald-100">当前身份</p>

            <div className="mt-3 space-y-2 text-sm text-slate-100">
              <p>
                <span className="text-slate-400">邮箱：</span>
                {currentEmail ?? "未知"}
              </p>
              <p>
                <span className="text-slate-400">昵称：</span>
                {profile.display_name ?? "未设置"}
              </p>
              <p>
                <span className="text-slate-400">身份：</span>
                {getRoleLabel(profile.role)}{" "}
                <span className="text-slate-500">({profile.role})</span>
              </p>
              <p>
                <span className="text-slate-400">订阅开始：</span>
                {profile.subscription_started_at ?? "未设置"}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}