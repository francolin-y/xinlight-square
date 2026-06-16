"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileRole = "admin" | "heroine" | "fan" | "guest";
type AccessStatus = "loading" | "signedOut" | "forbidden" | "allowed";

type PendingGift = {
  id: string;
  title_cn: string;
  price: number;
  status: string;
  image_path: string | null;
  created_at: string;
  created_by: string | null;
};

type RedemptionRow = {
  id: string;
  gift_id: string;
  user_id: string;
  price_paid: number;
  status: string;
  expected_arrival_at: string | null;
  received_at: string | null;
  created_at: string;
  giftTitle?: string;
};

type MessageRow = {
  id: string;
  content: string;
  author_display_name: string | null;
  author_role: ProfileRole | null;
  created_at: string;
};

type EnergyTransactionRow = {
  id: string;
  amount: number;
  transaction_type: string;
  source: string;
  description: string | null;
  created_at: string;
};

function formatDateTime(value: string | null) {
  if (!value) return "未设置";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRedemptionStatusLabel(status: string) {
  if (status === "pending_receipt") return "待签收";
  if (status === "received") return "已签收";
  if (status === "cancelled") return "已取消";
  return status;
}

function getAmountLabel(amount: number) {
  return amount > 0 ? `+${amount}` : `${amount}`;
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  const [accessStatus, setAccessStatus] = useState<AccessStatus>("loading");
  const [displayName, setDisplayName] = useState("站长");
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [energyTransactions, setEnergyTransactions] = useState<
    EnergyTransactionRow[]
  >([]);

  async function loadAdminDashboard() {
    setAccessStatus("loading");
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setAccessStatus("signedOut");
      setErrorMessage(userError.message);
      return;
    }

    if (!user) {
      setAccessStatus("signedOut");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setAccessStatus("forbidden");
      setErrorMessage(profileError?.message ?? "当前账号没有 profile 记录。");
      return;
    }

    const nextRole = profile.role as ProfileRole;
    setRole(nextRole);
    setDisplayName(profile.display_name ?? "站长");

    if (nextRole !== "admin") {
      setAccessStatus("forbidden");
      return;
    }

    setAccessStatus("allowed");

    await Promise.all([
      loadPendingGifts(),
      loadRecentRedemptions(),
      loadRecentMessages(),
      loadRecentEnergyTransactions(),
    ]);
  }

  async function loadPendingGifts() {
    const { data, error } = await supabase
      .from("gifts")
      .select("id, title_cn, price, status, image_path, created_at, created_by")
      .eq("status", "pending_admin")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPendingGifts((data ?? []) as PendingGift[]);
  }

  async function loadRecentRedemptions() {
    const { data: redemptionRows, error } = await supabase
      .from("redemptions")
      .select(
        "id, gift_id, user_id, price_paid, status, expected_arrival_at, received_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const rows = (redemptionRows ?? []) as RedemptionRow[];
    const giftIds = Array.from(new Set(rows.map((row) => row.gift_id)));

    if (giftIds.length === 0) {
      setRedemptions([]);
      return;
    }

    const { data: giftRows, error: giftError } = await supabase
      .from("gifts")
      .select("id, title_cn")
      .in("id", giftIds);

    if (giftError) {
      setErrorMessage(giftError.message);
      setRedemptions(rows);
      return;
    }

    const giftTitleMap = new Map(
      (giftRows ?? []).map((gift) => [gift.id, gift.title_cn]),
    );

    setRedemptions(
      rows.map((row) => ({
        ...row,
        giftTitle: giftTitleMap.get(row.gift_id) ?? "未知礼物",
      })),
    );
  }

  async function loadRecentMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("id, content, author_display_name, author_role, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessages((data ?? []) as MessageRow[]);
  }

  async function loadRecentEnergyTransactions() {
    const { data, error } = await supabase
      .from("energy_transactions")
      .select("id, amount, transaction_type, source, description, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEnergyTransactions((data ?? []) as EnergyTransactionRow[]);
  }

  useEffect(() => {
    void loadAdminDashboard();
  }, []);

  if (accessStatus === "loading") {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-28 text-stone-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-8">
          正在进入站长后台……
        </div>
      </main>
    );
  }

  if (accessStatus === "signedOut") {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-28 text-stone-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-8">
          <h1 className="text-2xl font-semibold">请先登录</h1>
          <p className="mt-3 text-stone-300">
            站长后台需要登录后访问。请先前往 /login 登录 admin 账号。
          </p>
          {errorMessage ? (
            <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
          ) : null}
        </div>
      </main>
    );
  }

  if (accessStatus === "forbidden") {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-28 text-stone-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-8">
          <h1 className="text-2xl font-semibold">无权限访问</h1>
          <p className="mt-3 text-stone-300">
            当前身份是 {role ?? "未知"}。只有 admin 可以进入站长后台。
          </p>
          {errorMessage ? (
            <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-24 text-stone-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                Admin Console
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
                站长后台
              </h1>
              <p className="mt-3 text-stone-300">
                当前账号：{displayName} · role: admin
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadAdminDashboard()}
              className="rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/20"
            >
              刷新后台数据
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-stone-400">待审核礼物</p>
            <p className="mt-2 text-3xl font-semibold">{pendingGifts.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-stone-400">近期兑换</p>
            <p className="mt-2 text-3xl font-semibold">{redemptions.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-stone-400">最近留言</p>
            <p className="mt-2 text-3xl font-semibold">{messages.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-stone-400">最近流水</p>
            <p className="mt-2 text-3xl font-semibold">
              {energyTransactions.length}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <h2 className="text-xl font-semibold">待审核礼物需求</h2>
            <div className="mt-5 space-y-3">
              {pendingGifts.length === 0 ? (
                <p className="text-sm text-stone-400">暂无待审核礼物。</p>
              ) : (
                pendingGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{gift.title_cn}</p>
                        <p className="mt-1 text-sm text-stone-400">
                          {gift.price} 星光值 · {formatDateTime(gift.created_at)}
                        </p>
                      </div>
                      <span className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100">
                        待审核
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <h2 className="text-xl font-semibold">近期兑换记录</h2>
            <div className="mt-5 space-y-3">
              {redemptions.length === 0 ? (
                <p className="text-sm text-stone-400">暂无兑换记录。</p>
              ) : (
                redemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {redemption.giftTitle ?? "未知礼物"}
                        </p>
                        <p className="mt-1 text-sm text-stone-400">
                          {redemption.price_paid} 星光值 ·{" "}
                          {formatDateTime(redemption.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          到货：{formatDateTime(redemption.expected_arrival_at)}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200/30 px-3 py-1 text-xs text-emerald-100">
                        {getRedemptionStatusLabel(redemption.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <h2 className="text-xl font-semibold">最近留言</h2>
            <div className="mt-5 space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-stone-400">暂无留言。</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="line-clamp-3 text-sm text-stone-200">
                      {message.content}
                    </p>
                    <p className="mt-3 text-xs text-stone-500">
                      {message.author_display_name ?? "匿名"} ·{" "}
                      {message.author_role ?? "unknown"} ·{" "}
                      {formatDateTime(message.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <h2 className="text-xl font-semibold">最近星光值流水</h2>
            <div className="mt-5 space-y-3">
              {energyTransactions.length === 0 ? (
                <p className="text-sm text-stone-400">暂无星光值流水。</p>
              ) : (
                energyTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {transaction.description ?? transaction.source}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {transaction.source} ·{" "}
                          {formatDateTime(transaction.created_at)}
                        </p>
                      </div>
                      <span
                        className={
                          transaction.amount >= 0
                            ? "text-lg font-semibold text-emerald-200"
                            : "text-lg font-semibold text-rose-200"
                        }
                      >
                        {getAmountLabel(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}