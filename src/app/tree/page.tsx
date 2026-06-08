"use client";

import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";

const treeCopies = {
  cn: {
    writeTitle: "写一句留言",
    textareaPlaceholder: "之后这里会接入密码或订阅权限",
    submit: "种下留言",
    messageTitle: "树上的留言",
    messages: [
      "今天也记得收集一点星光。",
      "这棵树以后会长出很多留言。",
      "某些留言可以和彩蛋、谜题或照片关联。",
    ],
  },
  en: {
    writeTitle: "Write a message",
    textareaPlaceholder:
      "Password or subscription permission will be connected here later.",
    submit: "Plant message",
    messageTitle: "Messages on the tree",
    messages: [
      "Remember to collect a little starlight today.",
      "This tree will grow many messages later.",
      "Some messages can be linked to easter eggs, puzzles, or photos.",
    ],
  },
};

export default function TreePage() {
  const { lang, t } = useLanguage();
  const page = treeCopies[lang];

  return (
    <PageShell
      title={t.tree.title}
      intro={t.tree.intro}
      loadingTitle={t.tree.loadingTitle}
      loadingSubtitle={t.tree.loadingSubtitle}
      loadingVariant="tree"
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">{page.writeTitle}</h2>

          <textarea
            placeholder={page.textareaPlaceholder}
            className="mt-5 min-h-40 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <button
            type="button"
            className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
          >
            {page.submit}
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">{page.messageTitle}</h2>

          <div className="mt-5 space-y-3">
            {page.messages.map((message) => (
              <div
                key={message}
                className="rounded-3xl bg-slate-950/60 px-5 py-4 text-slate-200"
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}