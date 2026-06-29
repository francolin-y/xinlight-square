"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import { ROSE_PASSWORD, type StudioPanel } from "@/data/studio";
import { createClient } from "@/lib/supabase/client";

type LocalizedText = {
  cn: string;
  en: string;
};

type StudioMediaType = "image" | "video";
type StudioCategory = "sunlight" | "heartbeat" | "rose" | "bloopers";
type StudioUnlockMode = "always" | "magic_puzzle" | "manual" | "password";
type StudioDisplayItemStatus = "active" | "hidden";
type StudioLoadStatus = "loading" | "allowed" | "signedOut" | "forbidden" | "error";

type StudioDisplayItemRpcRow = {
  id: string;
  title_cn: string;
  title_en: string;
  description_cn: string | null;
  description_en: string | null;
  teaser_cn: string;
  teaser_en: string;
  unlocked_note_cn: string | null;
  unlocked_note_en: string | null;
  media_type: StudioMediaType;
  category: StudioCategory;
  unlock_mode: StudioUnlockMode;
  status: StudioDisplayItemStatus;
  storage_path: string | null;
  thumbnail_path: string | null;
  required_puzzle_id: string | null;
  required_puzzle_title_cn: string | null;
  required_puzzle_title_en: string | null;
  sort_order: number;
  created_at: string;
  is_unlocked: boolean;
};

type StudioDisplayItem = {
  id: string;
  category: StudioCategory;
  type: "photo" | "video" | "voice";
  status: "unlocked" | "locked";
  title: LocalizedText;
  description: LocalizedText;
  teaser: LocalizedText;
  unlockedNote: LocalizedText;
  date: string;
  imageUrl: string;
  unlockMode: StudioUnlockMode;
  requiredPuzzleTitle: LocalizedText;
};

const studioCopies = {
  cn: {
    archiveEyebrow: "Underground Archive",
    archiveTitle: "地下暗房档案室",
    archiveIntro:
      "所有在魔法空间被解谜唤醒的照片、短片、语音和花絮，都会被收进这里。日光能看的挂在墙上，更靠近的锁进暗格。",
    totalSlices: "胶片总数",
    unlockedSlices: "已解锁",
    lockedSlices: "仍封存",
    unlockRate: "解锁率",
    darkroomTitle: "地下暗房操作台",
    darkroomIntro:
      "点击不同档案机关，查看已显影的切片。封存内容会保留位置，但暂时不会展示。",
    unlocked: "已解锁",
    locked: "封存中",
    close: "关闭",
    previous: "上一段",
    next: "下一段",
    current: "当前",
    viewLabel: "查看",
    openAll: "打开全部底片",
    passwordTitle: "玫瑰暗格需要密码",
    passwordIntro: "输入密码后，暗格里的相簿才会打开。",
    passwordPlaceholder: "输入暗格密码",
    passwordSubmit: "打开暗格",
    passwordError: "密码不对，暗格还没有松动。",
    roseUnlockedTitle: "玫瑰暗格相簿",
    playPlaceholder: "播放器占位",
    mediaPending: "真实媒体接入后会在这里播放。",
    lockedHint: "这枚切片还封存在魔法空间里。",
    developmentTitle: "新抽屉施工中",
    developmentIntro: "这里会留给未来的访客玩法、语音盒或节日限定档案。",
    types: {
      photo: "照片",
      video: "视频",
      voice: "语音",
    },
    categories: {
      sunlight: {
        title: "日光底片",
        intro: "玩家解锁后可公开浏览的照片。未来访客玩法开启后，这里会成为公开展示区。",
        action: "打开全部底片",
      },
      heartbeat: {
        title: "心跳短片",
        intro: "桌上的相机记录着被解锁的视频片段。",
        action: "打开心跳短片",
      },
      rose: {
        title: "玫瑰暗格",
        intro: "需要密码才能打开的私密相簿。",
        action: "输入暗格密码",
      },
      bloopers: {
        title: "笨蛋花絮",
        intro: "左侧抽屉里塞着不太正经的搞笑片段。",
        action: "展开花絮胶卷",
      },
    },
    loadingArchive: "正在读取记忆暗房……",
    signedOutArchive: "请先登录后进入记忆暗房。",
    forbiddenArchive: "当前身份暂时不能进入记忆暗房。",
    loadErrorArchive: "记忆暗房读取失败。",
    emptyArchive: "暗房里还没有内容。",
  },
  en: {
    archiveEyebrow: "Underground Archive",
    archiveTitle: "Underground Darkroom Archive",
    archiveIntro:
      "Every photo, clip, voice note, and blooper unlocked from the magic space is stored here. Public memories hang in daylight; closer ones are locked deeper inside.",
    totalSlices: "Total reels",
    unlockedSlices: "Unlocked",
    lockedSlices: "Still sealed",
    unlockRate: "Unlock rate",
    darkroomTitle: "Darkroom Workbench",
    darkroomIntro:
      "Open different archive mechanisms to view developed slices. Sealed content keeps its place but stays hidden.",
    unlocked: "Unlocked",
    locked: "Sealed",
    close: "Close",
    previous: "Previous",
    next: "Next",
    current: "Current",
    viewLabel: "View",
    openAll: "Open all negatives",
    passwordTitle: "Rose compartment requires a password",
    passwordIntro: "Enter the password to open the album inside.",
    passwordPlaceholder: "Enter password",
    passwordSubmit: "Open compartment",
    passwordError: "Wrong password. The compartment does not move.",
    roseUnlockedTitle: "Rose Compartment Album",
    playPlaceholder: "Player placeholder",
    mediaPending: "Real media will play here after integration.",
    lockedHint: "This slice is still sealed in the magic space.",
    developmentTitle: "New drawer under construction",
    developmentIntro: "Reserved for future guest features, voice boxes, or seasonal archives.",
    types: {
      photo: "Photo",
      video: "Video",
      voice: "Voice",
    },
    categories: {
      sunlight: {
        title: "Sunlight Negatives",
        intro:
          "Photos that can become public after the main player unlocks them. This will later support guest browsing.",
        action: "Open all negatives",
      },
      heartbeat: {
        title: "Heartbeat Clips",
        intro: "The camera on the desk stores unlocked video fragments.",
        action: "Open clips",
      },
      rose: {
        title: "Rose Compartment",
        intro: "A private album that requires a password.",
        action: "Enter password",
      },
      bloopers: {
        title: "Silly Bloopers",
        intro: "The left drawer stores less serious, funny fragments.",
        action: "Unroll bloopers",
      },
    },
    loadingArchive: "Loading Memory Darkroom...",
    signedOutArchive: "Please sign in before entering the Memory Darkroom.",
    forbiddenArchive: "Your current role cannot enter the Memory Darkroom yet.",
    loadErrorArchive: "Failed to load Memory Darkroom.",
    emptyArchive: "No items in the darkroom yet.",
  },
};

function formatStudioDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapStudioDisplayItemRow(row: StudioDisplayItemRpcRow, imageUrl: string): StudioDisplayItem {
  return {
    id: row.id.slice(0, 8),
    category: row.category,
    type: row.media_type === "video" ? "video" : "photo",
    status: row.is_unlocked ? "unlocked" : "locked",
    title: {
      cn: row.title_cn,
      en: row.title_en,
    },
    description: {
      cn: row.description_cn ?? row.unlocked_note_cn ?? row.title_cn,
      en: row.description_en ?? row.unlocked_note_en ?? row.title_en,
    },
    teaser: {
      cn: row.teaser_cn,
      en: row.teaser_en,
    },
    unlockedNote: {
      cn: row.unlocked_note_cn ?? "",
      en: row.unlocked_note_en ?? "",
    },
    date: formatStudioDate(row.created_at),
    imageUrl,
    unlockMode: row.unlock_mode,
    requiredPuzzleTitle: {
      cn: row.required_puzzle_title_cn ?? "",
      en: row.required_puzzle_title_en ?? "",
    },
  };
}

export default function StudioPage() {
  const { lang, t } = useLanguage();
  const page = studioCopies[lang];
  const supabase = useMemo(() => createClient(), []);

  const [activePanel, setActivePanel] = useState<StudioPanel | null>(null);
  const [roseUnlocked, setRoseUnlocked] = useState(false);
  const [rosePassword, setRosePassword] = useState("");
  const [roseError, setRoseError] = useState("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<StudioDisplayItem | null>(null);

  const [studioItems, setStudioDisplayItems] = useState<StudioDisplayItem[]>([]);
  const [studioLoadStatus, setStudioLoadStatus] =
    useState<StudioLoadStatus>("loading");
  const [studioLoadMessage, setStudioLoadMessage] = useState("");

  const sunlightItems = studioItems.filter((item) => item.category === "sunlight");
  const heartbeatItems = studioItems.filter((item) => item.category === "heartbeat");
  const roseItems = studioItems.filter((item) => item.category === "rose");
  const blooperItems = studioItems.filter((item) => item.category === "bloopers");

  const totalCount = studioItems.length;
  const unlockedCount = studioItems.filter((item) => item.status === "unlocked").length;
  const lockedCount = totalCount - unlockedCount;
  const unlockRate =
    totalCount === 0 ? 0 : Math.round((unlockedCount / totalCount) * 100);

  const currentVideo = heartbeatItems[currentVideoIndex] ?? heartbeatItems[0];

  function openPanel(panel: StudioPanel) {
    setActivePanel(panel);
    setRoseError("");

    if (panel === "heartbeat") {
      setCurrentVideoIndex(0);
    }

    if (panel === "rose") {
      setRosePassword("");
    }
  }

  function closePanel() {
    setActivePanel(null);
    setRoseError("");
    setRosePassword("");
  }

  function openStudioItem(item: StudioDisplayItem) {
    if (item.status === "locked") return;
    setSelectedItem(item);
  }

  function closeStudioItem() {
    setSelectedItem(null);
  }

  function submitRosePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rosePassword.trim() === ROSE_PASSWORD) {
      setRoseUnlocked(true);
      setRoseError("");
      return;
    }

    setRoseError(page.passwordError);
  }

  function goPreviousVideo() {
    setCurrentVideoIndex((current) =>
      current === 0 ? heartbeatItems.length - 1 : current - 1,
    );
  }

  function goNextVideo() {
    setCurrentVideoIndex((current) =>
      current === heartbeatItems.length - 1 ? 0 : current + 1,
    );
  }

  async function loadStudioDisplayItems() {
    setStudioLoadStatus("loading");
    setStudioLoadMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // Public-read mode: anonymous visitors can still view Studio items.
      // The RPC controls which items expose storage_path.
    } else {
      // Authenticated users use the same public-read RPC.
    }

    const { data, error } = await supabase.rpc("get_studio_items");

    if (error) {
      const message = error.message;

      if (message.includes("当前身份")) {
        setStudioLoadStatus("forbidden");
      } else {
        setStudioLoadStatus("error");
      }

      setStudioLoadMessage(message);
      setStudioDisplayItems([]);
      return;
    }

    const rows = (data ?? []) as StudioDisplayItemRpcRow[];

    const mappedItems = await Promise.all(
      rows.map(async (row) => {
        let imageUrl = "";

        if (row.is_unlocked && row.storage_path) {
          const { data: signedData } = await supabase.storage
            .from("studio-media")
            .createSignedUrl(row.storage_path, 60 * 60);

          imageUrl = signedData?.signedUrl ?? "";
        }

        return mapStudioDisplayItemRow(row, imageUrl);
      }),
    );

    setStudioDisplayItems(mappedItems);
    setStudioLoadStatus("allowed");
  }

  useEffect(() => {
    void loadStudioDisplayItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      title={t.studio.title}
      intro={t.studio.intro}
      loadingTitle={t.studio.loadingTitle}
      loadingSubtitle={t.studio.loadingSubtitle}
      loadingVariant="studio"
      backgroundVariant="studio"
      fontVariant="studio"
    >
      <section className="mb-6 rounded-[2rem] border border-amber-100/15 bg-slate-950/50 p-6 shadow-2xl shadow-black/35 backdrop-blur-md ring-1 ring-amber-100/10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/80">
              {page.archiveEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">
              {page.archiveTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-200/85">
              {page.archiveIntro}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <ProgressTile label={page.totalSlices} value={totalCount} />
            <ProgressTile label={page.unlockedSlices} value={unlockedCount} />
            <ProgressTile label={page.lockedSlices} value={lockedCount} />
            <ProgressTile label={page.unlockRate} value={`${unlockRate}%`} />
          </div>
        </div>
      </section>

      {studioLoadStatus !== "allowed" ? (
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-black/35 p-5 text-sm text-stone-200 backdrop-blur-md">
          {studioLoadStatus === "loading" ? page.loadingArchive : null}
          {studioLoadStatus === "forbidden" ? page.forbiddenArchive : null}
          {studioLoadStatus === "error"
            ? `${page.loadErrorArchive} ${studioLoadMessage}`
            : null}
        </section>
      ) : null}

      {studioLoadStatus === "allowed" && studioItems.length === 0 ? (
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-black/35 p-5 text-sm text-stone-200 backdrop-blur-md">
          {page.emptyArchive}
        </section>
      ) : null}

      <section className="rounded-[2.25rem] border border-white/10 bg-black/35 p-5 shadow-2xl shadow-black/40 backdrop-blur-md ring-1 ring-white/10 md:p-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/75">
              Darkroom Desk
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-50 md:text-3xl">
              {page.darkroomTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
              {page.darkroomIntro}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openPanel("development")}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-stone-100 backdrop-blur transition hover:bg-white/15"
          >
            {page.developmentTitle}
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <SunlightWorkbench
            title={page.categories.sunlight.title}
            intro={page.categories.sunlight.intro}
            openAllLabel={page.openAll}
            lockedLabel={page.locked}
            unlockedLabel={page.unlocked}
            items={sunlightItems}
            lang={lang}
            onOpenAll={() => openPanel("sunlight")}
            onOpenItem={openStudioItem}
          />

          <div className="grid gap-5">
            <MechanismCard
              variant="camera"
              title={page.categories.heartbeat.title}
              intro={page.categories.heartbeat.intro}
              action={page.categories.heartbeat.action}
              count={heartbeatItems.length}
              unlocked={heartbeatItems.filter((item) => item.status === "unlocked").length}
              onClick={() => openPanel("heartbeat")}
            />

            <MechanismCard
              variant="rose"
              title={page.categories.rose.title}
              intro={page.categories.rose.intro}
              action={page.categories.rose.action}
              count={roseItems.length}
              unlocked={roseItems.filter((item) => item.status === "unlocked").length}
              onClick={() => openPanel("rose")}
            />

            <MechanismCard
              variant="film"
              title={page.categories.bloopers.title}
              intro={page.categories.bloopers.intro}
              action={page.categories.bloopers.action}
              count={blooperItems.length}
              unlocked={blooperItems.filter((item) => item.status === "unlocked").length}
              onClick={() => openPanel("bloopers")}
            />
          </div>
        </div>
      </section>

      {activePanel && (
      <div className="fixed inset-0 z-[90] grid items-start justify-items-center overflow-y-auto bg-black/70 px-4 pb-8 pt-48 backdrop-blur-sm md:items-start md:justify-items-center md:pb-10 md:pt-28">
          <section className="relative max-h-[calc(100vh-14rem)] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-amber-100/15 bg-stone-950/95 shadow-2xl shadow-black ring-1 ring-white/10 md:max-h-[calc(100vh-10rem)]">
            <button
              type="button"
              onClick={closePanel}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-stone-100 backdrop-blur transition hover:bg-white/15"
            >
              {page.close}
            </button>

            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-5 md:max-h-[calc(100vh-10rem)] md:p-7">
              {activePanel === "sunlight" && (
                <SunlightLightboxViewer
                  title={page.categories.sunlight.title}
                  intro={page.categories.sunlight.intro}
                  items={sunlightItems}
                  lang={lang}
                  typeLabels={page.types}
                  lockedLabel={page.locked}
                  unlockedLabel={page.unlocked}
                  lockedHint={page.lockedHint}
                  onOpenItem={openStudioItem}
                />
              )}

              {activePanel === "heartbeat" && currentVideo && (
                <CameraViewer
                  title={page.categories.heartbeat.title}
                  intro={page.categories.heartbeat.intro}
                  currentVideo={currentVideo}
                  currentIndex={currentVideoIndex}
                  total={heartbeatItems.length}
                  lang={lang}
                  currentLabel={page.current}
                  lockedLabel={page.locked}
                  unlockedLabel={page.unlocked}
                  lockedHint={page.lockedHint}
                  mediaPending={page.mediaPending}
                  previousLabel={page.previous}
                  nextLabel={page.next}
                  playPlaceholder={page.playPlaceholder}
                  onPrevious={goPreviousVideo}
                  onNext={goNextVideo}
                  onOpenItem={openStudioItem}
                />
              )}

              {activePanel === "rose" && (
                <RoseCompartmentViewer
                  title={page.categories.rose.title}
                  intro={page.categories.rose.intro}
                  passwordTitle={page.passwordTitle}
                  passwordIntro={page.passwordIntro}
                  passwordPlaceholder={page.passwordPlaceholder}
                  passwordSubmit={page.passwordSubmit}
                  roseUnlockedTitle={page.roseUnlockedTitle}
                  password={rosePassword}
                  error={roseError}
                  isUnlocked={roseUnlocked}
                  items={roseItems}
                  lang={lang}
                  typeLabels={page.types}
                  lockedLabel={page.locked}
                  unlockedLabel={page.unlocked}
                  lockedHint={page.lockedHint}
                  onPasswordChange={setRosePassword}
                  onSubmit={submitRosePassword}
                  onOpenItem={openStudioItem}
                />
              )}

              {activePanel === "bloopers" && (
                <BlooperReelViewer
                  title={page.categories.bloopers.title}
                  intro={page.categories.bloopers.intro}
                  items={blooperItems}
                  lang={lang}
                  typeLabels={page.types}
                  lockedLabel={page.locked}
                  unlockedLabel={page.unlocked}
                  lockedHint={page.lockedHint}
                  onOpenItem={openStudioItem}
                />
              )}

              {activePanel === "development" && (
                <div className="mx-auto max-w-xl text-center">
                  <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[2rem] border border-amber-100/15 bg-amber-100/10 text-4xl text-amber-100">
                    ▣
                  </div>
                  <h2 className="text-3xl font-semibold text-stone-50">
                    {page.developmentTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    {page.developmentIntro}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {selectedItem ? (
        <StudioItemModal
          item={selectedItem}
          lang={lang}
          closeLabel={page.close}
          lockedLabel={page.locked}
          unlockedLabel={page.unlocked}
          onClose={closeStudioItem}
        />
      ) : null}
    </PageShell>
  );
}

function ProgressTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur">
      <p className="text-xs text-amber-100/75">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-50">{value}</p>
    </div>
  );
}

function SunlightWorkbench({
  title,
  intro,
  openAllLabel,
  lockedLabel,
  unlockedLabel,
  items,
  lang,
  onOpenItem,
  onOpenAll,
}: {
  title: string;
  intro: string;
  openAllLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  items: StudioDisplayItem[];
  lang: "cn" | "en";
  onOpenItem: (item: StudioDisplayItem) => void;
  onOpenAll: () => void;
}) {
  const unlockedCount = items.filter((item) => item.status === "unlocked").length;

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-amber-100/15 bg-stone-950/55 p-5 shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-stone-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-100/75">
            Sunlight Line
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-stone-50 md:text-3xl">
            {title}
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
            {intro}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-stone-200">
            {unlockedCount} / {items.length}
          </span>

          <button
            type="button"
            onClick={onOpenAll}
            className="rounded-full bg-amber-100 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-white"
          >
            {openAllLabel}
          </button>
        </div>
      </div>

      <div className="relative rounded-[1.75rem] border border-white/10 bg-black/25 p-4 shadow-inner">
        <div className="pointer-events-none absolute left-6 right-6 top-14 h-px bg-gradient-to-r from-transparent via-amber-100/45 to-transparent" />

        <div className="pointer-events-none absolute left-6 top-[3.35rem] h-2 w-2 rounded-full bg-amber-100/60 shadow-[0_0_18px_rgba(253,230,138,0.8)]" />
        <div className="pointer-events-none absolute right-6 top-[3.35rem] h-2 w-2 rounded-full bg-amber-100/60 shadow-[0_0_18px_rgba(253,230,138,0.8)]" />

        <div className="overflow-x-auto pb-3 pt-4">
          <div className="flex min-w-max gap-5 px-2 pt-8">
            {items.map((item, index) => (
              <HangingNegativeCard
                key={item.id}
                item={item}
                index={index}
                lang={lang}
                lockedLabel={lockedLabel}
                unlockedLabel={unlockedLabel}
                onClick={() => onOpenItem(item)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm text-stone-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-stone-500">Archive</p>
            <p className="mt-1 text-stone-100">{title}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-stone-500">Developed</p>
            <p className="mt-1 text-stone-100">
              {unlockedCount} / {items.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-stone-500">Status</p>
            <p className="mt-1 text-stone-100">
              {unlockedCount === items.length ? unlockedLabel : lockedLabel}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function HangingNegativeCard({
  item,
  index,
  lang,
  lockedLabel,
  unlockedLabel,
  onClick,
}: {
  item: StudioDisplayItem;
  index: number;
  lang: "cn" | "en";
  lockedLabel: string;
  unlockedLabel: string;
  onClick: () => void;
}) {
  const isLocked = item.status === "locked";
  const rotationClass =
    index % 4 === 0
      ? "-rotate-3"
      : index % 4 === 1
        ? "rotate-2"
        : index % 4 === 2
          ? "-rotate-1"
          : "rotate-3";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-40 shrink-0 transition duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0",
        rotationClass,
      ].join(" ")}
    >
      <span className="absolute left-1/2 top-[-1.85rem] z-20 h-8 w-5 -translate-x-1/2 rounded-sm border border-amber-100/25 bg-gradient-to-b from-stone-600 to-stone-950 shadow-lg">
        <span className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-100/55" />
      </span>

      <span className="absolute left-1/2 top-[-0.55rem] z-10 h-5 w-px -translate-x-1/2 bg-amber-100/25" />

      <div
        className={[
          "overflow-hidden rounded-md border p-2 shadow-2xl transition duration-300",
          isLocked
            ? "border-white/10 bg-stone-950/85 opacity-65"
            : "border-amber-100/30 bg-stone-100 group-hover:shadow-amber-950/40",
        ].join(" ")}
      >
        <div
          className={[
            "relative grid aspect-[3/4] place-items-center overflow-hidden rounded-sm border",
            isLocked
              ? "border-white/10 bg-stone-900"
              : "border-stone-900/20 bg-gradient-to-br from-stone-800 via-stone-500 to-amber-100",
          ].join(" ")}
        >
          <div className="absolute inset-y-0 left-0 z-10 w-3 bg-black/35">
            <div className="grid h-full grid-rows-6 gap-1 p-1">
              {Array.from({ length: 6 }).map((_, dotIndex) => (
                <span key={dotIndex} className="rounded-sm bg-stone-300/35" />
              ))}
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 z-10 w-3 bg-black/35">
            <div className="grid h-full grid-rows-6 gap-1 p-1">
              {Array.from({ length: 6 }).map((_, dotIndex) => (
                <span key={dotIndex} className="rounded-sm bg-stone-300/35" />
              ))}
            </div>
          </div>

          {!isLocked && item.imageUrl && item.type !== "video" ? (
            <img
              src={item.imageUrl}
              alt={item.title[lang]}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="px-5 text-center">
              <div
                className={[
                  "mx-auto grid h-14 w-14 place-items-center rounded-2xl border text-2xl",
                  isLocked
                    ? "border-white/10 bg-black/35 text-stone-500"
                    : "border-amber-100/30 bg-amber-100/20 text-amber-50",
                ].join(" ")}
              >
                {isLocked ? "▣" : "◒"}
              </div>

              <p
                className={[
                  "mt-3 text-xs font-medium leading-5",
                  isLocked ? "text-stone-500" : "text-stone-50",
                ].join(" ")}
              >
                {isLocked ? lockedLabel : item.title[lang]}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-[0.68rem]">
          <span className={isLocked ? "text-stone-500" : "text-stone-700"}>
            {item.id}
          </span>
          <span className={isLocked ? "text-stone-500" : "text-stone-700"}>
            {isLocked ? lockedLabel : unlockedLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

function MechanismCard({
  variant,
  title,
  intro,
  action,
  count,
  unlocked,
  onClick,
}: {
  variant: "camera" | "rose" | "film";
  title: string;
  intro: string;
  action: string;
  count: number;
  unlocked: number;
  onClick: () => void;
}) {
  const isCamera = variant === "camera";
  const isRose = variant === "rose";
  const isFilm = variant === "film";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-stone-950/60 p-5 text-left shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-amber-100/25 hover:bg-stone-900/75"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-200/10 blur-3xl transition group-hover:bg-amber-200/20" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-black/40 blur-3xl" />

      <div className="relative grid gap-5 md:grid-cols-[9rem_1fr] md:items-center">
        <div className="relative grid h-36 place-items-center rounded-[1.5rem] border border-amber-100/15 bg-black/35 shadow-inner">
          {isCamera && <CameraGlyph />}
          {isRose && <RoseDrawerGlyph />}
          {isFilm && <FilmReelGlyph />}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-stone-300">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
              {unlocked} / {count}
            </span>
            <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-3 py-1 text-amber-100">
              {action}
            </span>
          </div>

          <h3 className="text-2xl font-semibold text-stone-50">{title}</h3>

          <p className="mt-3 text-sm leading-6 text-stone-300">{intro}</p>

          <div className="mt-4 flex items-center gap-2 text-sm text-amber-100/80">
            <span className="h-px w-8 bg-amber-100/35 transition group-hover:w-12" />
            <span>{action}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function CameraGlyph() {
  return (
    <div className="relative h-24 w-28">
      <div className="absolute left-5 top-1 h-5 w-12 rounded-t-xl border border-amber-100/25 bg-stone-800" />
      <div className="absolute inset-x-0 top-5 h-16 rounded-2xl border border-amber-100/25 bg-gradient-to-b from-stone-700 to-stone-950 shadow-2xl" />

      <div className="absolute left-1/2 top-9 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border border-amber-100/30 bg-black shadow-[0_0_28px_rgba(251,191,36,0.18)] transition group-hover:shadow-[0_0_42px_rgba(251,191,36,0.32)]">
        <div className="h-7 w-7 rounded-full border border-amber-100/25 bg-stone-900" />
      </div>

      <div className="absolute right-4 top-8 h-3 w-3 rounded-full bg-amber-100/70 shadow-[0_0_18px_rgba(253,230,138,0.7)]" />
    </div>
  );
}

function RoseDrawerGlyph() {
  return (
    <div className="relative h-24 w-32">
      <div className="absolute inset-x-0 top-2 h-20 rounded-2xl border border-amber-100/20 bg-gradient-to-b from-stone-700 to-stone-950 shadow-2xl" />

      <div className="absolute left-4 right-4 top-8 h-px bg-amber-100/20" />
      <div className="absolute left-1/2 top-10 h-8 w-6 -translate-x-1/2 rounded-b-full border border-amber-100/30 bg-black/50" />

      <div className="absolute left-5 top-5 text-lg text-amber-100/55">✦</div>
      <div className="absolute right-5 top-5 text-lg text-amber-100/55">✦</div>

      <div className="absolute inset-x-6 bottom-3 h-1 rounded-full bg-amber-100/25 transition group-hover:bg-amber-100/45" />
    </div>
  );
}

function FilmReelGlyph() {
  return (
    <div className="relative h-28 w-24 overflow-hidden rounded-xl border border-amber-100/20 bg-black/45 p-2 shadow-2xl">
      <div className="grid h-full grid-rows-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="relative rounded-md border border-amber-100/15 bg-gradient-to-r from-stone-800 via-stone-600 to-stone-900"
          >
            <div className="absolute left-1 top-1 h-2 w-2 rounded-sm bg-black/60" />
            <div className="absolute left-1 bottom-1 h-2 w-2 rounded-sm bg-black/60" />
            <div className="absolute right-1 top-1 h-2 w-2 rounded-sm bg-black/60" />
            <div className="absolute right-1 bottom-1 h-2 w-2 rounded-sm bg-black/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-6 pr-20">
      <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">{intro}</p>
    </div>
  );
}

function ArchiveEntry({
  item,
  lang,
  typeLabel,
  lockedLabel,
  unlockedLabel,
  lockedHint,
}: {
  item: StudioDisplayItem;
  lang: "cn" | "en";
  typeLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
}) {
  const isLocked = item.status === "locked";

  return (
    <article
      className={[
        "overflow-hidden rounded-[1.5rem] border shadow-xl",
        isLocked
          ? "border-white/5 bg-white/5 opacity-60"
          : "border-white/10 bg-white/10",
      ].join(" ")}
    >
      <div className="grid aspect-[4/3] place-items-center bg-stone-900">
        <div
          className={[
            "grid h-20 w-20 place-items-center rounded-[1.35rem] border text-3xl",
            isLocked
              ? "border-white/10 bg-black/30 text-stone-500"
              : "border-amber-100/20 bg-amber-100/10 text-amber-100",
          ].join(" ")}
        >
          {isLocked ? "▣" : item.type === "video" ? "▶" : item.type === "voice" ? "≈" : "◒"}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-300">
            {item.id}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-300">
            {typeLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-300">
            {isLocked ? lockedLabel : unlockedLabel}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-stone-50">{item.title[lang]}</h3>
        <p className="mt-2 text-xs text-stone-500">{item.date}</p>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          {isLocked ? item.teaser[lang] : item.description[lang]}
        </p>
      </div>
    </article>
  );
}

function CameraViewer({
  title,
  intro,
  currentVideo,
  currentIndex,
  total,
  lang,
  currentLabel,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  mediaPending,
  previousLabel,
  nextLabel,
  playPlaceholder,
  onPrevious,
  onNext,
  onOpenItem,
}: {
  title: string;
  intro: string;
  currentVideo: StudioDisplayItem;
  currentIndex: number;
  total: number;
  lang: "cn" | "en";
  currentLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  mediaPending: string;
  previousLabel: string;
  nextLabel: string;
  playPlaceholder: string;
  onPrevious: () => void;
  onNext: () => void;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const isLocked = currentVideo.status === "locked";

  return (
    <>
      <ModalHeader eyebrow="Camera Viewfinder" title={title} intro={intro} />

      <div className="rounded-[2rem] border border-white/10 bg-black/55 p-4 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-red-300/20 bg-red-500/15 px-3 py-1 text-red-200">
              ● REC
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
              {currentLabel} {currentIndex + 1} / {total}
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
              {currentVideo.id}
            </span>
          </div>

          <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-3 py-1 text-amber-100">
            {isLocked ? lockedLabel : unlockedLabel}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-stone-950 shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(0,0,0,0.62)_100%)]" />

          <div className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l border-t border-amber-100/35" />
          <div className="pointer-events-none absolute right-5 top-5 h-10 w-10 border-r border-t border-amber-100/35" />
          <div className="pointer-events-none absolute bottom-5 left-5 h-10 w-10 border-b border-l border-amber-100/35" />
          <div className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b border-r border-amber-100/35" />

          <button
            type="button"
            onClick={() => onOpenItem(currentVideo)}
            disabled={isLocked}
            className="relative grid aspect-video w-full place-items-center px-6 py-10 text-left transition disabled:cursor-not-allowed"
          >
            {!isLocked && currentVideo.imageUrl && currentVideo.type !== "video" ?(
              <img
                src={currentVideo.imageUrl}
                alt={currentVideo.title[lang]}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
            ) : null}

            <div className="absolute inset-0 bg-black/35" />

            <div className="relative text-center">
              <div
                className={[
                  "mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border text-4xl shadow-2xl",
                  isLocked
                    ? "border-white/10 bg-black/50 text-stone-500"
                    : "border-amber-100/25 bg-amber-100/10 text-amber-100 shadow-amber-950/40",
                ].join(" ")}
              >
                {isLocked ? "▣" : currentVideo.type === "video" ? "▶" : "◒"}
              </div>

              <p className="mt-5 text-xs uppercase tracking-[0.28em] text-stone-300">
                {playPlaceholder}
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-stone-50 md:text-3xl">
                {isLocked ? lockedLabel : currentVideo.title[lang]}
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-300">
                {isLocked ? currentVideo.teaser[lang] : mediaPending}
              </p>
            </div>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs text-stone-300 backdrop-blur">
            <span>00:{String(currentIndex + 1).padStart(2, "0")}:19</span>
            <span className="h-1 w-1 rounded-full bg-stone-500" />
            <span>{currentVideo.date}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <button
            type="button"
            onClick={onPrevious}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-stone-100 transition hover:bg-white/15"
          >
            {previousLabel}
          </button>

          <div className="hidden h-px w-24 bg-gradient-to-r from-transparent via-amber-100/35 to-transparent md:block" />

          <button
            type="button"
            onClick={onNext}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-stone-100 transition hover:bg-white/15"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </>
  );
}

function RoseCompartmentViewer({
  title,
  intro,
  passwordTitle,
  passwordIntro,
  passwordPlaceholder,
  passwordSubmit,
  roseUnlockedTitle,
  password,
  error,
  isUnlocked,
  items,
  lang,
  typeLabels,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onPasswordChange,
  onSubmit,
  onOpenItem,
}: {
  title: string;
  intro: string;
  passwordTitle: string;
  passwordIntro: string;
  passwordPlaceholder: string;
  passwordSubmit: string;
  roseUnlockedTitle: string;
  password: string;
  error: string;
  isUnlocked: boolean;
  items: StudioDisplayItem[];
  lang: "cn" | "en";
  typeLabels: Record<"photo" | "video" | "voice", string>;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const midpoint = Math.ceil(items.length / 2);
  const leftPageItems = items.slice(0, midpoint);
  const rightPageItems = items.slice(midpoint);

  if (!isUnlocked) {
    return (
      <>
        <ModalHeader eyebrow="Locked Drawer" title={passwordTitle} intro={passwordIntro} />

        <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-100/15 bg-black/45 p-5 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:p-7">
          <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-stone-700 to-stone-950 p-6 shadow-inner">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_45%)]" />

            <div className="relative mx-auto max-w-xl">
              <div className="rounded-[1.5rem] border border-amber-100/20 bg-stone-950/60 p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-100/65">
                      Rose Compartment
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-stone-50">
                      {title}
                    </h3>
                  </div>

                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-100/20 bg-black/45 text-2xl text-amber-100">
                    ◇
                  </div>
                </div>

                <div className="relative h-28 rounded-2xl border border-amber-100/15 bg-gradient-to-b from-stone-800 to-black">
                  <div className="absolute left-6 right-6 top-1/2 h-px bg-amber-100/20" />

                  <div className="absolute left-1/2 top-1/2 grid h-16 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-b-2xl border border-amber-100/25 bg-black/65 shadow-[0_0_30px_rgba(251,191,36,0.12)]">
                    <span className="text-xl text-amber-100">▣</span>
                  </div>

                  <div className="absolute left-8 top-7 text-amber-100/45">✦</div>
                  <div className="absolute right-8 top-7 text-amber-100/45">✦</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mx-auto max-w-xl">
            <label className="mb-2 block text-sm text-stone-300">
              {passwordPlaceholder}
            </label>

            <input
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder={passwordPlaceholder}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-stone-50 outline-none placeholder:text-stone-500 focus:border-amber-100/35"
            />

            {error && <p className="mt-3 text-sm text-amber-200">{error}</p>}

            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-amber-100 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-white"
            >
              {passwordSubmit}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <ModalHeader eyebrow="Rose Album" title={roseUnlockedTitle} intro={intro} />

      <div className="rounded-[2rem] border border-amber-100/15 bg-black/45 p-4 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/65">
              Open Album
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-50">
              {title}
            </h3>
          </div>

          <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-4 py-2 text-sm text-amber-100">
            {unlockedLabel}
          </span>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-stone-950/60 p-4 md:grid-cols-2 md:p-5">
          <AlbumPage
            pageLabel="I"
            items={leftPageItems}
            lang={lang}
            typeLabels={typeLabels}
            lockedLabel={lockedLabel}
            unlockedLabel={unlockedLabel}
            lockedHint={lockedHint}
            onOpenItem={onOpenItem}
          />

          <AlbumPage
            pageLabel="II"
            items={rightPageItems}
            lang={lang}
            typeLabels={typeLabels}
            lockedLabel={lockedLabel}
            unlockedLabel={unlockedLabel}
            lockedHint={lockedHint}
            onOpenItem={onOpenItem}
          />
        </div>
      </div>
    </>
  );
}

function AlbumPage({
  pageLabel,
  items,
  lang,
  typeLabels,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  pageLabel: string;
  items: StudioDisplayItem[];
  lang: "cn" | "en";
  typeLabels: Record<"photo" | "video" | "voice", string>;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  return (
    <div className="relative min-h-[28rem] rounded-[1.5rem] border border-stone-900/20 bg-stone-200 p-4 text-stone-950 shadow-inner">
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_center,rgba(120,53,15,0.12),transparent_50%)]" />

      <div className="relative mb-4 flex items-center justify-between gap-4 border-b border-stone-900/15 pb-3">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-600">
          Page {pageLabel}
        </p>
        <p className="text-xs text-stone-500">Rose Archive</p>
      </div>

      <div className="relative grid gap-4">
        {items.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-stone-900/20 bg-stone-100/60 text-sm text-stone-500">
            Empty page
          </div>
        ) : (
          items.map((item, index) => (
            <AlbumPhotoCard
              key={item.id}
              item={item}
              index={index}
              lang={lang}
              typeLabel={typeLabels[item.type]}
              lockedLabel={lockedLabel}
              unlockedLabel={unlockedLabel}
              lockedHint={lockedHint}
              onOpenItem={onOpenItem}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AlbumPhotoCard({
  item,
  index,
  lang,
  typeLabel,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  item: StudioDisplayItem;
  index: number;
  lang: "cn" | "en";
  typeLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const isLocked = item.status === "locked";
  const rotationClass = index % 2 === 0 ? "-rotate-1" : "rotate-1";

  return (
    <button
      type="button"
      onClick={() => onOpenItem(item)}
      disabled={isLocked}
      className={[
        "relative rounded-2xl bg-stone-50 p-3 text-left shadow-xl transition duration-300 hover:rotate-0 disabled:cursor-not-allowed",
        rotationClass,
        isLocked ? "opacity-65" : "",
      ].join(" ")}
    >
      <div
        className={[
          "relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border",
          isLocked
            ? "border-stone-900/10 bg-stone-300"
            : "border-stone-900/10 bg-gradient-to-br from-stone-800 via-stone-500 to-amber-100",
        ].join(" ")}
      >
        {!isLocked && item.imageUrl && item.type !== "video" ? (
          <img
            src={item.imageUrl}
            alt={item.title[lang]}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={[
              "grid h-16 w-16 place-items-center rounded-2xl border text-2xl",
              isLocked
                ? "border-stone-900/10 bg-stone-900/15 text-stone-500"
                : "border-amber-100/30 bg-amber-100/20 text-amber-50",
            ].join(" ")}
          >
            {isLocked ? "▣" : "◒"}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-900/10 px-2.5 py-1 text-[0.68rem] text-stone-600">
            {item.id}
          </span>
          <span className="rounded-full bg-stone-900/10 px-2.5 py-1 text-[0.68rem] text-stone-600">
            {typeLabel}
          </span>
          <span className="rounded-full bg-stone-900/10 px-2.5 py-1 text-[0.68rem] text-stone-600">
            {isLocked ? lockedLabel : unlockedLabel}
          </span>
        </div>

        <h4 className="font-semibold text-stone-950">
          {isLocked ? lockedLabel : item.title[lang]}
        </h4>

        <p className="mt-1 text-xs text-stone-500">{item.date}</p>

        <p className="mt-2 text-sm leading-6 text-stone-700">
          {isLocked ? item.teaser[lang] : item.description[lang]}
        </p>
      </div>
    </button>
  );
}

function BlooperReelViewer({
  title,
  intro,
  items,
  lang,
  typeLabels,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  title: string;
  intro: string;
  items: StudioDisplayItem[];
  lang: "cn" | "en";
  typeLabels: Record<"photo" | "video" | "voice", string>;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const unlockedCount = items.filter((item) => item.status === "unlocked").length;

  return (
    <>
      <ModalHeader eyebrow="Blooper Reel" title={title} intro={intro} />

      <div className="rounded-[2rem] border border-amber-100/15 bg-black/50 p-4 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/65">
              Vertical Film Strip
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-50">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-stone-200">
              {unlockedCount} / {items.length}
            </span>
            <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-4 py-2 text-amber-100">
              {unlockedLabel}
            </span>
          </div>
        </div>

        <div className="relative max-h-[62vh] overflow-y-auto rounded-[1.75rem] border border-white/10 bg-stone-950/70 p-4 shadow-inner">
          <div className="pointer-events-none absolute left-8 top-0 bottom-0 w-px bg-amber-100/20" />
          <div className="pointer-events-none absolute right-8 top-0 bottom-0 w-px bg-amber-100/20" />

          <div className="relative mx-auto max-w-3xl space-y-5 py-2">
            {items.map((item, index) => (
              <BlooperFilmFrame
                key={item.id}
                item={item}
                index={index}
                lang={lang}
                typeLabel={typeLabels[item.type]}
                lockedLabel={lockedLabel}
                unlockedLabel={unlockedLabel}
                lockedHint={lockedHint}
                onOpenItem={onOpenItem}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function BlooperFilmFrame({
  item,
  index,
  lang,
  typeLabel,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  item: StudioDisplayItem;
  index: number;
  lang: "cn" | "en";
  typeLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const isLocked = item.status === "locked";
  const isVideo = item.type === "video";
  const isVoice = item.type === "voice";

  const icon = isLocked ? "▣" : isVideo ? "▶" : isVoice ? "≈" : "◒";

  return (
    <button
      type="button"
      onClick={() => onOpenItem(item)}
      disabled={isLocked}
      className={[
        "relative w-full overflow-hidden rounded-[1.5rem] border bg-black/45 p-3 text-left shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-black/55 disabled:cursor-not-allowed",
        isLocked ? "border-white/5 opacity-65" : "border-amber-100/15",
      ].join(" ")}
    >
      <div className="absolute left-2 top-0 grid h-full w-4 grid-rows-6 gap-2 py-3">
        {Array.from({ length: 6 }).map((_, dotIndex) => (
          <span
            key={dotIndex}
            className="rounded-sm border border-white/10 bg-stone-950"
          />
        ))}
      </div>

      <div className="absolute right-2 top-0 grid h-full w-4 grid-rows-6 gap-2 py-3">
        {Array.from({ length: 6 }).map((_, dotIndex) => (
          <span
            key={dotIndex}
            className="rounded-sm border border-white/10 bg-stone-950"
          />
        ))}
      </div>

      <div className="grid gap-4 pl-8 pr-8 md:grid-cols-[11rem_1fr] md:items-stretch">
        <div
          className={[
            "relative grid min-h-40 place-items-center overflow-hidden rounded-[1.25rem] border",
            isLocked
              ? "border-white/10 bg-stone-900"
              : "border-amber-100/20 bg-gradient-to-br from-stone-800 via-stone-600 to-amber-100",
          ].join(" ")}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(0,0,0,0.24))]" />

          {!isLocked && item.imageUrl && item.type !== "video" ?  (
            <img
              src={item.imageUrl}
              alt={item.title[lang]}
              className="absolute inset-0 h-full w-full object-cover opacity-85"
            />
          ) : null}

          <div
            className={[
              "relative grid h-20 w-20 place-items-center rounded-[1.5rem] border text-3xl shadow-2xl",
              isLocked
                ? "border-white/10 bg-black/35 text-stone-500"
                : "border-amber-100/30 bg-amber-100/20 text-amber-50",
            ].join(" ")}
          >
            {icon}
          </div>

          <span className="absolute left-3 top-3 rounded-full border border-black/20 bg-black/35 px-2.5 py-1 text-xs text-stone-100 backdrop-blur">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-col justify-between py-1">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-300">
                {item.id}
              </span>

              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-300">
                {typeLabel}
              </span>

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs",
                  isLocked
                    ? "border-white/10 bg-white/5 text-stone-500"
                    : "border-amber-100/15 bg-amber-100/10 text-amber-100",
                ].join(" ")}
              >
                {isLocked ? lockedLabel : unlockedLabel}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-stone-50">
              {isLocked ? lockedLabel : item.title[lang]}
            </h3>

            <p className="mt-2 text-xs text-stone-500">{item.date}</p>

            <p className="mt-3 text-sm leading-7 text-stone-300">
              {isLocked ? item.teaser[lang] : item.description[lang]}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-amber-100/70">
            <span className="h-px w-10 bg-amber-100/35" />
            <span>
              {isLocked
                ? "Sealed Frame"
                : isVideo
                  ? "Video Frame"
                  : isVoice
                    ? "Voice Frame"
                    : "Photo Frame"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function SunlightLightboxViewer({
  title,
  intro,
  items,
  lang,
  typeLabels,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  title: string;
  intro: string;
  items: StudioDisplayItem[];
  lang: "cn" | "en";
  typeLabels: Record<"photo" | "video" | "voice", string>;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const unlockedCount = items.filter((item) => item.status === "unlocked").length;

  return (
    <>
      <ModalHeader eyebrow="Light Table" title={title} intro={intro} />

      <div className="rounded-[2rem] border border-amber-100/15 bg-black/50 p-4 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/65">
              Developed Negatives
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-50">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-stone-200">
              {unlockedCount} / {items.length}
            </span>
            <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-4 py-2 text-amber-100">
              {unlockedLabel}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-stone-950/75 p-4 shadow-inner md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.16),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-amber-100/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-amber-100/25 to-transparent" />

          <div className="relative rounded-[1.5rem] border border-amber-100/15 bg-gradient-to-b from-amber-100/10 via-stone-900/70 to-black/70 p-4 shadow-[inset_0_0_60px_rgba(251,191,36,0.08)] md:p-6">
            <div className="mb-5 grid gap-3 border-b border-white/10 pb-4 text-sm text-stone-300 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-stone-500">Archive</p>
                <p className="mt-1 text-stone-100">{title}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-stone-500">Developed</p>
                <p className="mt-1 text-stone-100">
                  {unlockedCount} / {items.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-stone-500">Table</p>
                <p className="mt-1 text-stone-100">Warm Light Check</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => (
                <LightTableNegative
                  key={item.id}
                  item={item}
                  index={index}
                  lang={lang}
                  typeLabel={typeLabels[item.type]}
                  lockedLabel={lockedLabel}
                  unlockedLabel={unlockedLabel}
                  lockedHint={lockedHint}
                  onOpenItem={onOpenItem}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LightTableNegative({
  item,
  index,
  lang,
  typeLabel,
  lockedLabel,
  unlockedLabel,
  lockedHint,
  onOpenItem,
}: {
  item: StudioDisplayItem;
  index: number;
  lang: "cn" | "en";
  typeLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  lockedHint: string;
  onOpenItem: (item: StudioDisplayItem) => void;
}) {
  const isLocked = item.status === "locked";
  const rotationClass =
    index % 4 === 0
      ? "-rotate-1"
      : index % 4 === 1
        ? "rotate-1"
        : index % 4 === 2
          ? "rotate-[0.5deg]"
          : "-rotate-[0.5deg]";

  return (
    <button
      type="button"
      onClick={() => onOpenItem(item)}
      disabled={isLocked}
      className={[
        "group relative overflow-hidden rounded-[1.5rem] border p-3 shadow-2xl transition duration-300 hover:-translate-y-1 hover:rotate-0",
        rotationClass,
        isLocked
          ? "border-white/5 bg-black/45 opacity-65"
          : "border-amber-100/20 bg-stone-100/95 text-stone-950",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[1.2rem] border",
          isLocked
            ? "border-white/10 bg-stone-900"
            : "border-stone-900/15 bg-gradient-to-br from-stone-800 via-stone-500 to-amber-100",
        ].join(" ")}
      >
        <div className="absolute inset-y-0 left-0 w-5 bg-black/40">
          <div className="grid h-full grid-rows-7 gap-1 p-1">
            {Array.from({ length: 7 }).map((_, dotIndex) => (
              <span key={dotIndex} className="rounded-sm bg-stone-200/35" />
            ))}
          </div>
        </div>

        <div className="absolute inset-y-0 right-0 w-5 bg-black/40">
          <div className="grid h-full grid-rows-7 gap-1 p-1">
            {Array.from({ length: 7 }).map((_, dotIndex) => (
              <span key={dotIndex} className="rounded-sm bg-stone-200/35" />
            ))}
          </div>
        </div>

        <div className="grid aspect-[4/3] place-items-center px-8 py-6">
          {!isLocked && item.imageUrl && item.type !== "video" ? (
            <img
              src={item.imageUrl}
              alt={item.title[lang]}
              className="h-full w-full rounded-xl object-cover shadow-2xl"
            />
          ) : (
            <div
              className={[
                "grid h-20 w-20 place-items-center rounded-[1.5rem] border text-3xl shadow-2xl",
                isLocked
                  ? "border-white/10 bg-black/35 text-stone-500"
                  : "border-amber-100/30 bg-amber-100/20 text-amber-50 shadow-amber-950/30",
              ].join(" ")}
            >
              {isLocked ? "▣" : "◒"}
            </div>
          )}
        </div>

        <div className="absolute left-3 top-3 rounded-full border border-black/20 bg-black/35 px-2.5 py-1 text-xs text-stone-100 backdrop-blur">
          {item.id}
        </div>
      </div>

      <div className={isLocked ? "mt-4 text-stone-300" : "mt-4 text-stone-950"}>
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs",
              isLocked
                ? "border border-white/10 bg-white/10 text-stone-400"
                : "bg-stone-900/10 text-stone-700",
            ].join(" ")}
          >
            {typeLabel}
          </span>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs",
              isLocked
                ? "border border-white/10 bg-white/10 text-stone-400"
                : "bg-stone-900/10 text-stone-700",
            ].join(" ")}
          >
            {isLocked ? lockedLabel : unlockedLabel}
          </span>
        </div>

        <h3 className="text-lg font-semibold">
          {isLocked ? lockedLabel : item.title[lang]}
        </h3>

        <p className={isLocked ? "mt-2 text-xs text-stone-500" : "mt-2 text-xs text-stone-600"}>
          {item.date}
        </p>

        <p
          className={[
            "mt-3 text-sm leading-6",
            isLocked ? "text-stone-400" : "text-stone-700",
          ].join(" ")}
        >
          {isLocked ? item.teaser[lang] : item.description[lang]}
        </p>
      </div>
    </button>
  );
}

function StudioItemModal({
  item,
  lang,
  closeLabel,
  lockedLabel,
  unlockedLabel,
  onClose,
}: {
  item: StudioDisplayItem;
  lang: "cn" | "en";
  closeLabel: string;
  lockedLabel: string;
  unlockedLabel: string;
  onClose: () => void;
}) {
  const isLocked = item.status === "locked";

  return (
    <div className="fixed inset-0 z-[100] grid items-start justify-items-center overflow-y-auto bg-black/75 px-4 pb-8 pt-48 backdrop-blur-md md:items-start md:justify-items-center md:pb-10 md:pt-28">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0"
      />

      <section className="relative z-10 max-h-[calc(100vh-14rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-amber-100/20 bg-stone-950/95 p-5 shadow-2xl shadow-black ring-1 ring-amber-100/10 md:max-h-[calc(100vh-10rem)] md:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">
              Developed Negative
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-50 md:text-3xl">
              {item.title[lang]}
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              {item.date} · {isLocked ? lockedLabel : unlockedLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-stone-100 transition hover:bg-white/15"
          >
            {closeLabel}
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/45">
          {item.imageUrl && item.type === "video" ? (
            <video
              src={item.imageUrl}
              controls
              playsInline
              className="max-h-[62vh] w-full bg-black object-contain"
            />
          ) : item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title[lang]}
              className="max-h-[62vh] w-full object-contain"
            />
          ) : (
            <div className="grid aspect-video place-items-center text-stone-500">
              ▣
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-stone-500">
              Description
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-200">
              {item.description[lang]}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100/15 bg-amber-100/10 p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-amber-100/70">
              Unlock Note
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-200">
              {item.unlockedNote[lang] || item.teaser[lang]}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}