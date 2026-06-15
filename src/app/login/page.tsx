"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  role: "admin" | "heroine" | "fan" | "guest";
  subscription_started_at: string | null;
};

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [status, setStatus] = useState("Checking current session...");
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadCurrentUser() {
    setStatus("Checking current user...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setStatus(`User check failed: ${userError.message}`);
      setProfile(null);
      return;
    }

    if (!user) {
      setStatus("Not logged in.");
      setProfile(null);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, role, subscription_started_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setStatus(`Logged in, but profile read failed: ${profileError.message}`);
      setProfile(null);
      return;
    }

    setProfile(data as Profile);
    setStatus(`Logged in as ${user.email}`);
  }

  async function handleSignUp() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus("Email and password are required.");
      return;
    }

    setStatus("Creating account...");

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          display_name: displayName.trim() || undefined,
        },
      },
    });

    if (error) {
      setStatus(`Sign up failed: ${error.message}`);
      return;
    }

    setStatus(
      "Sign up succeeded. If email confirmation is enabled, confirm the email first, then sign in.",
    );

    await loadCurrentUser();
  }

  async function handleSignIn() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus("Email and password are required.");
      return;
    }

    setStatus("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      setStatus(`Sign in failed: ${error.message}`);
      return;
    }

    await loadCurrentUser();
  }

  async function handleSignOut() {
    setStatus("Signing out...");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(`Sign out failed: ${error.message}`);
      return;
    }

    setProfile(null);
    setStatus("Signed out.");
  }

  useEffect(() => {
    loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-20 text-white">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-200">
          Account Gate
        </p>

        <h1 className="mt-4 text-3xl font-semibold">最小登录测试</h1>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="比如：站长"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-200/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-200/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="至少 6 位"
              autoComplete="current-password"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-200/50"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSignUp}
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-100"
          >
            Sign up
          </button>

          <button
            type="button"
            onClick={handleSignIn}
            className="rounded-full bg-sky-200 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Sign out
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 leading-7 text-slate-100">{status}</p>
        </div>

        {profile ? (
          <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
            <p className="text-sm text-emerald-100">Profile</p>

            <div className="mt-3 space-y-2 text-sm text-slate-100">
              <p>
                <span className="text-slate-400">Display name:</span>{" "}
                {profile.display_name ?? "未设置"}
              </p>
              <p>
                <span className="text-slate-400">Role:</span> {profile.role}
              </p>
              <p>
                <span className="text-slate-400">Subscription started:</span>{" "}
                {profile.subscription_started_at ?? "未设置"}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}