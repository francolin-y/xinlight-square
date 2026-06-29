"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EntryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isEnteringGuest, setIsEnteringGuest] = useState(false);
  const [status, setStatus] = useState("");

  async function handleVisitAsGuest() {
    setIsEnteringGuest(true);
    setStatus("正在以访客身份进入星光广场……");

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

    setStatus("正在进入星光广场……");
    router.push("/plaza");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-[2.25rem] border border-white/10 bg-white/10 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-10">
          <p className="text-sm uppercase tracking-[0.34em] text-sky-200">
            Xinlight Square
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            进入星光广场
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            这里是星光系统的外层入口。你可以登录专属身份，也可以以访客身份进入，浏览已经公开的星光内容。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-sky-200 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              登录身份
            </Link>

            <button
              type="button"
              onClick={() => void handleVisitAsGuest()}
              disabled={isEnteringGuest}
              className="rounded-full border border-sky-200/30 bg-sky-100/10 px-6 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-100/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEnteringGuest ? "正在进入……" : "Visit as guest"}
            </button>
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
            <p>
              访客可以进入天空广场、魔法空间、快乐批发市场和记忆暗房。
              解谜、兑换、签到等主线动作仍然只属于小欣。
            </p>

            {status ? <p className="mt-3 text-sky-100">{status}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}