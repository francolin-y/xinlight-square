"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

const treeCopies = {
  cn: {
    writeTitle: "写一句留言",
    textareaPlaceholder: "把想说的话写下来，种到这棵树上。",
    submit: "种下留言",
    messageTitle: "树上的留言",
    emptyHint: "留言会成为树上的一片新叶子。",
    plantedLabel: "刚刚种下",
    savedLabel: "已生长",
    treeStatus: "留言树状态",
    treeStatusValue: "静静生长",
    messages: [
      "第一片叶子先挂在这里。",
      "这棵树会慢慢长出更多想说的话。",
      "有些话不需要立刻被看见，只要被好好留下。",
    ],
  },
  en: {
    writeTitle: "Write a message",
    textareaPlaceholder: "Write down what you want to say and plant it here.",
    submit: "Plant message",
    messageTitle: "Messages on the tree",
    emptyHint: "Each message becomes a new leaf on the tree.",
    plantedLabel: "Just planted",
    savedLabel: "Growing",
    treeStatus: "Message tree status",
    treeStatusValue: "Quietly growing",
    messages: [
      "The first leaf is placed here.",
      "This tree will slowly grow more words.",
      "Some words do not need to be seen immediately. They only need to be kept.",
    ],
  },
};

const treeBackgrounds = {
  desktop: "/backgrounds/tree/tree-main-desktop.png",
  mobile: "/backgrounds/tree/tree-main-mobile.png",
};

type ProfileRole = "admin" | "heroine" | "fan" | "guest";

type TreeMessage = {
  id: string;
  text: string;
  fresh?: boolean;
  createdAt?: string;
  authorName?: string | null;
  authorRole?: ProfileRole | null;
};

function getAuthorLabel(
  role: ProfileRole | null | undefined,
  fallbackName: string | null | undefined,
) {
  if (role === "admin") return fallbackName || "站长";
  if (role === "heroine") return fallbackName || "女主人公";
  if (role === "fan") return fallbackName || "粉丝";
  return fallbackName || "匿名叶子";
}

function formatMessageTime(date: string | undefined, lang: "cn" | "en") {
  if (!date) return "";

  return new Intl.DateTimeFormat(lang === "cn" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function TreePage() {
  const { lang, t } = useLanguage();
  const page = treeCopies[lang];
  const supabase = createClient();

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<TreeMessage[]>([]);
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messageStatus, setMessageStatus] = useState("");

  const canPlantMessage = role === "heroine" || role === "admin";

  async function loadCurrentProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setRole(null);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      setRole(null);
      return;
    }

    setRole(data.role as ProfileRole);
  }

  async function loadMessages() {
    setIsLoadingMessages(true);

    const { data, error } = await supabase
      .from("messages")
      .select("id, content, created_at, author_display_name, author_role")
      .order("created_at", { ascending: false });

    if (error) {
      setMessageStatus(`读取留言失败：${error.message}`);
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    setMessages(
      data.map((message) => ({
        id: message.id,
        text: message.content,
        createdAt: message.created_at,
        authorName: message.author_display_name,
        authorRole: message.author_role as ProfileRole | null,
      })),
    );

    setMessageStatus("");
    setIsLoadingMessages(false);
  }

  useEffect(() => {
    loadCurrentProfile();
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function plantMessage() {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) return;

    const canPlantMessage = role === "heroine" || role === "admin";

    if (!canPlantMessage) {
      setMessageStatus("目前只有女主人公和管理猿可以留言。");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessageStatus("需要登录女主人公账号。");
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        content: trimmedDraft,
      })
      .select("id, content, created_at, author_display_name, author_role")
      .single();

    if (error) {
      setMessageStatus(`种下留言失败：${error.message}`);
      return;
    }

    setMessages((current) => [
      {
        id: data.id,
        text: data.content,
        createdAt: data.created_at,
        authorName: data.author_display_name,
        authorRole: data.author_role as ProfileRole | null,
        fresh: true,
      },
      ...current,
    ]);

    setDraft("");
    setMessageStatus("");
  }

  return (
    <PageShell
      title={t.tree.title}
      intro={t.tree.intro}
      loadingTitle={t.tree.loadingTitle}
      loadingSubtitle={t.tree.loadingSubtitle}
      loadingVariant="tree"
      fontVariant="tree"
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="hidden h-full w-full bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: `url(${treeBackgrounds.desktop})` }}
        />
        <div
          className="block h-full w-full bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: `url(${treeBackgrounds.mobile})` }}
        />
        <div className="absolute inset-0 bg-emerald-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(187,247,208,0.08),transparent_48%)]" />
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-emerald-200/10 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-4xl shadow-lg ring-1 ring-white/20">
              ❦
            </div>

            <h2 className="text-2xl font-semibold">{page.writeTitle}</h2>

            <p className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-emerald-100">
              {page.treeStatus}: {page.treeStatusValue}
            </p>

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={page.textareaPlaceholder}
              className="mt-5 min-h-40 w-full resize-none rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50 focus:ring-2 focus:ring-emerald-200/20"
            />

            <button
              type="button"
              onClick={plantMessage}
              disabled={!draft.trim() || !canPlantMessage}
              className={[
                "mt-4 rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed",
                draft.trim()
                  ? "bg-white text-slate-950 hover:bg-emerald-100"
                  : "bg-white/10 text-white/40",
              ].join(" ")}
            >
              {page.submit}
            </button>

            {messageStatus ? (
              <p className="mt-3 text-sm text-emerald-100/80">{messageStatus}</p>
            ) : !draft.trim() ? (
              <p className="mt-3 text-sm text-slate-400">{page.emptyHint}</p>
            ) : role !== "heroine" ? (
              <p className="mt-3 text-sm text-emerald-100/80">
                目前只有女主人公和管理猿可以留言。
              </p>
            ) : null}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-200/10 to-transparent" />
          <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-100">
                  Tree
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {page.messageTitle}
                </h2>
              </div>

              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                {messages.length} ❦
              </div>
            </div>

            <div className="relative">
              <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-emerald-100/0 via-emerald-100/35 to-emerald-100/0" />

              <div className="space-y-3">
                {isLoadingMessages ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/45 px-5 py-4 text-slate-300">
                    正在读取留言……
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/45 px-5 py-4 text-slate-300">
                    这棵树还没有真实留言。
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <article key={message.id} className="relative pl-12">
                      <div className="absolute left-[18px] top-5 h-3 w-3 rounded-full bg-emerald-200 shadow-[0_0_18px_rgba(167,243,208,0.9)]" />

                      <div
                        className={[
                          "rounded-3xl border px-5 py-4 shadow-lg backdrop-blur transition",
                          message.fresh
                            ? "border-emerald-200/40 bg-emerald-200/15"
                            : "border-white/10 bg-slate-950/45",
                        ].join(" ")}
                      >
                        <p className="leading-7 text-slate-100">
                          {message.text}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100/80">
                          <span>
                            {getAuthorLabel(message.authorRole, message.authorName)}
                          </span>

                          <span>
                            {message.fresh
                              ? page.plantedLabel
                              : formatMessageTime(message.createdAt, lang)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}