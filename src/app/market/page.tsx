"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

type Lang = "cn" | "en";
type ProfileRole = "admin" | "heroine" | "fan" | "guest";
type GiftType = "virtual" | "physical" | "date_plan";
type GiftStatus = "available" | "redeemed";
type DatabaseGiftStatus = "active" | "hidden" | "pending_admin";

type GiftRow = {
  id: string;
  slug: string;
  title_cn: string;
  title_en: string;
  description_cn: string;
  description_en: string;
  gift_type: GiftType;
  price: number;
  icon: string;
  status: DatabaseGiftStatus;
  sort_order: number;
  created_by: string | null;
  image_path: string | null;
  submitted_at: string | null;
};

type GiftView = {
  id: string;
  title: string;
  type: string;
  status: GiftStatus;
  icon: string;
  description: string;
  price: number;
  imagePath: string | null;
};

type GiftAdminTask = {
  id: string;
  gift_id: string;
  created_by: string | null;
  task_type: "gift_request";
  status: "open" | "done" | "cancelled";
  title: string;
  created_at: string;
  resolved_at: string | null;
};

const marketCopies = {
  cn: {
    priceLabel: "价格",
    statusLabel: "状态",
    priceUnit: "星光值",
    redeem: "兑换",
    redeemed: "已兑换",
    available: "可兑换",
    shelfTitle: "今日快乐货架",
    shelfIntro: "每一份礼物都可以用积攒的星光值兑换。",
    loading: "正在读取快乐货架……",
    empty: "货架暂时为空。",
    errorPrefix: "读取礼物失败",
    requestTitle: "上传礼物需求",
    requestIntro: "小欣提交后，管理猿会进行审核哒。",
    requestName: "礼物标题",
    requestNamePlaceholder: "比如：一次夜晚散步计划",
    requestDescription: "礼物说明",
    requestDescriptionPlaceholder: "写下这个礼物会带来什么。",
    requestPrice: "定价",
    requestIcon: "图标",
    requestImage: "礼物图片",
    requestImagePlaceholder: "选择一张礼物图片",
    requestImageHelp: "管理猿上传图片后，礼物卡片会显示真实图片。",
    requestType: "类型",
    requestSubmitHeroine: "提交给管理猿审核",
    requestSubmitAdmin: "直接上架礼物",
    requestSuccessHeroine: "礼物需求已提交给管理猿审核。",
    requestSuccessAdmin: "礼物已直接上架。",
    requestOnly: "当前仅小欣和管理猿可以上传礼物需求哦。",
    requestMissing: "请填写礼物标题和有效定价。",
    requestFailed: "提交失败",
    adminTodoTitle: "管理猿待处理礼物需求",
    adminTodoEmpty: "当前没有待处理礼物需求。",
    adminTodoCount: "待处理",
    reviewImageLabel: "礼物图片",
    reviewImagePlaceholder: "选择一张礼物图片",
    reviewImageHelp: "图片会上传到 Supabase Storage，并显示在礼物卡片中。",
    reviewActivate: "上传图片并上架",
    reviewActivated: "礼物已上架。",
    reviewMissingImage: "请先选择礼物图片。",
    reviewFailed: "上架失败",
    uploadFailed: "图片上传失败",
    uploadingImage: "正在上传图片……",
    heroinePendingTitle: "我的礼物需求通知",
    heroinePendingEmpty: "当前没有待审核礼物需求。",
    pendingStatus: "等待管理猿审核",
  },
  en: {
    priceLabel: "Price",
    statusLabel: "Status",
    priceUnit: "starlight value",
    redeem: "Redeem",
    redeemed: "Redeemed",
    available: "Available",
    shelfTitle: "Today’s Happiness Shelf",
    shelfIntro:
      "Each gift can be redeemed with the starlight value you have collected.",
    loading: "Loading happiness shelf...",
    empty: "The shelf is empty for now.",
    errorPrefix: "Failed to load gifts",
    requestTitle: "Upload a gift request",
    requestIntro:
      "Heroine submissions go to admin review first. Admin-created gifts go live directly.",
    requestName: "Gift title",
    requestNamePlaceholder: "For example: A night walk plan",
    requestDescription: "Gift description",
    requestDescriptionPlaceholder: "Describe what this gift unlocks.",
    requestPrice: "Price",
    requestIcon: "Icon",
    requestImage: "Gift image",
    requestImagePlaceholder: "Choose a gift image",
    requestImageHelp:
      "Admin uploads the image, and the gift card will show the real image.",
    requestType: "Type",
    requestSubmitHeroine: "Submit for admin review",
    requestSubmitAdmin: "Publish gift directly",
    requestSuccessHeroine: "Gift request submitted for admin review.",
    requestSuccessAdmin: "Gift published directly.",
    requestOnly: "Only the heroine and admin can upload gift requests.",
    requestMissing: "Please enter a gift title and a valid price.",
    requestFailed: "Submission failed",
    adminTodoTitle: "Admin gift requests",
    adminTodoEmpty: "There are no open gift requests.",
    adminTodoCount: "Open",
    reviewImageLabel: "Gift image",
    reviewImagePlaceholder: "Choose a gift image",
    reviewImageHelp:
      "The image will be uploaded to Supabase Storage and shown on the gift card.",
    reviewActivate: "Upload image and publish",
    reviewActivated: "Gift published.",
    reviewMissingImage: "Please choose a gift image first.",
    reviewFailed: "Publishing failed",
    uploadFailed: "Image upload failed",
    uploadingImage: "Uploading image...",
    heroinePendingTitle: "My gift request notifications",
    heroinePendingEmpty: "There are no pending gift requests.",
    pendingStatus: "Waiting for admin review",
  },
};

const giftTypeCopies: Record<Lang, Record<GiftType, string>> = {
  cn: {
    virtual: "虚拟礼物",
    physical: "实物",
    date_plan: "一次计划",
  },
  en: {
    virtual: "Virtual gift",
    physical: "Physical gift",
    date_plan: "A plan",
  },
};

const marketBackgrounds = {
  desktop: "/backgrounds/market/market-main-desktop.png",
  mobile: "/backgrounds/market/market-main-mobile.png",
};

const giftImageBucket = "gift-images";

function mapGiftRowToView(row: GiftRow, lang: Lang): GiftView {
  return {
    id: row.id,
    title: lang === "cn" ? row.title_cn : row.title_en,
    type: giftTypeCopies[lang][row.gift_type],
    status: "available",
    icon: row.icon,
    description: lang === "cn" ? row.description_cn : row.description_en,
    price: row.price,
    imagePath: row.image_path,
  };
}

function createGiftSlug(title: string) {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const fallback = normalizedTitle || "gift";
  return `${fallback}-${Date.now()}`;
}

function formatTaskTime(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "cn" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName) {
    return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";

  return "jpg";
}

export default function MarketPage() {
  const { lang, t } = useLanguage();
  const currentLang = lang as Lang;
  const page = marketCopies[currentLang];
  const supabase = createClient();

  const [role, setRole] = useState<ProfileRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [giftRows, setGiftRows] = useState<GiftRow[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [giftError, setGiftError] = useState("");

  const [adminTasks, setAdminTasks] = useState<GiftAdminTask[]>([]);
  const [pendingGifts, setPendingGifts] = useState<GiftRow[]>([]);
  const [reviewImageFiles, setReviewImageFiles] = useState<
    Record<string, File | null>
  >({});
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewingGiftId, setReviewingGiftId] = useState<string | null>(null);

  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestPrice, setRequestPrice] = useState("1");
  const [requestIcon, setRequestIcon] = useState("◆");
  const [requestImageFile, setRequestImageFile] = useState<File | null>(null);
  const [requestType, setRequestType] = useState<GiftType>("virtual");
  const [requestStatus, setRequestStatus] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const gifts = giftRows.map((gift) => mapGiftRowToView(gift, currentLang));
  const canUploadGift = role === "admin" || role === "heroine";

  async function loadGifts() {
    setIsLoadingGifts(true);

    const { data, error } = await supabase
      .from("gifts")
      .select(
        "id, slug, title_cn, title_en, description_cn, description_en, gift_type, price, icon, status, sort_order, created_by, image_path, submitted_at",
      )
      .eq("status", "active")
      .order("sort_order", { ascending: true });

    if (error) {
      setGiftError(`${page.errorPrefix}：${error.message}`);
      setGiftRows([]);
      setIsLoadingGifts(false);
      return;
    }

    setGiftRows((data ?? []) as GiftRow[]);
    setGiftError("");
    setIsLoadingGifts(false);
  }

  async function loadAdminTasks(currentRole: ProfileRole | null) {
    if (currentRole !== "admin") {
      setAdminTasks([]);
      return;
    }

    const { data } = await supabase
      .from("gift_admin_tasks")
      .select(
        "id, gift_id, created_by, task_type, status, title, created_at, resolved_at",
      )
      .eq("status", "open")
      .order("created_at", { ascending: false });

    setAdminTasks((data ?? []) as GiftAdminTask[]);
  }

  async function loadPendingGifts(currentRole: ProfileRole | null) {
    if (currentRole !== "admin" && currentRole !== "heroine") {
      setPendingGifts([]);
      return;
    }

    const { data } = await supabase
      .from("gifts")
      .select(
        "id, slug, title_cn, title_en, description_cn, description_en, gift_type, price, icon, status, sort_order, created_by, image_path, submitted_at",
      )
      .eq("status", "pending_admin")
      .order("submitted_at", { ascending: false });

    const nextPendingGifts = (data ?? []) as GiftRow[];

    setPendingGifts(nextPendingGifts);
  }

  async function reloadRoleBasedPanels(nextRole = role) {
    await Promise.all([loadAdminTasks(nextRole), loadPendingGifts(nextRole)]);
  }

  async function uploadGiftImage(file: File, giftId: string) {
    const extension = getFileExtension(file);
    const filePath = `gifts/${giftId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(giftImageBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(giftImageBucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmitGiftRequest() {
    const trimmedTitle = requestTitle.trim();
    const trimmedDescription = requestDescription.trim();
    const parsedPrice = Number(requestPrice);
    const trimmedIcon = requestIcon.trim() || "◆";

    if (!canUploadGift || !userId) {
      setRequestStatus(page.requestOnly);
      return;
    }

    if (!trimmedTitle || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setRequestStatus(page.requestMissing);
      return;
    }

    setIsSubmittingRequest(true);

    const isAdmin = role === "admin";
    const nextStatus: DatabaseGiftStatus = isAdmin ? "active" : "pending_admin";

    const { data, error } = await supabase
      .from("gifts")
      .insert({
        slug: createGiftSlug(trimmedTitle),
        created_by: userId,
        title_cn: trimmedTitle,
        title_en: trimmedTitle,
        description_cn: trimmedDescription || trimmedTitle,
        description_en: trimmedDescription || trimmedTitle,
        gift_type: requestType,
        price: Math.round(parsedPrice),
        icon: trimmedIcon.slice(0, 8),
        image_path: null,
        status: nextStatus,
        sort_order: Math.floor(Date.now() / 1000),
      })
      .select("id")
      .single();

    if (error) {
      setRequestStatus(`${page.requestFailed}：${error.message}`);
      setIsSubmittingRequest(false);
      return;
    }

    if (isAdmin && requestImageFile && data?.id) {
      try {
        const imagePublicUrl = await uploadGiftImage(requestImageFile, data.id);

        const { error: updateImageError } = await supabase
          .from("gifts")
          .update({ image_path: imagePublicUrl })
          .eq("id", data.id);

        if (updateImageError) {
          setRequestStatus(`${page.uploadFailed}：${updateImageError.message}`);
          setIsSubmittingRequest(false);
          return;
        }
      } catch (uploadError) {
        setRequestStatus(
          `${page.uploadFailed}：${
            uploadError instanceof Error ? uploadError.message : "Unknown error"
          }`,
        );
        setIsSubmittingRequest(false);
        return;
      }
    }

    setRequestTitle("");
    setRequestDescription("");
    setRequestPrice("1");
    setRequestIcon("◆");
    setRequestImageFile(null);
    setRequestType("virtual");
    setRequestStatus(
      isAdmin ? page.requestSuccessAdmin : page.requestSuccessHeroine,
    );
    setIsSubmittingRequest(false);

    await loadGifts();
    await reloadRoleBasedPanels(role);
  }

  async function handleActivateGift(giftId: string) {
    if (role !== "admin") return;

    const imageFile = reviewImageFiles[giftId];

    if (!imageFile) {
      setReviewStatus(page.reviewMissingImage);
      return;
    }

    setReviewingGiftId(giftId);
    setReviewStatus(page.uploadingImage);

    let imagePublicUrl = "";

    try {
      imagePublicUrl = await uploadGiftImage(imageFile, giftId);
    } catch (uploadError) {
      setReviewStatus(
        `${page.uploadFailed}：${
          uploadError instanceof Error ? uploadError.message : "Unknown error"
        }`,
      );
      setReviewingGiftId(null);
      return;
    }

    const { error: giftError } = await supabase
      .from("gifts")
      .update({
        image_path: imagePublicUrl,
        status: "active",
        sort_order: Math.floor(Date.now() / 1000),
      })
      .eq("id", giftId);

    if (giftError) {
      setReviewStatus(`${page.reviewFailed}：${giftError.message}`);
      setReviewingGiftId(null);
      return;
    }

    await supabase
      .from("gift_admin_tasks")
      .update({
        status: "done",
        resolved_at: new Date().toISOString(),
      })
      .eq("gift_id", giftId)
      .eq("status", "open");

    setReviewImageFiles((current) => ({
      ...current,
      [giftId]: null,
    }));
    setReviewStatus(page.reviewActivated);
    setReviewingGiftId(null);

    await loadGifts();
    await reloadRoleBasedPanels(role);
  }

  useEffect(() => {
    async function loadPageData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let nextRole: ProfileRole | null = null;
      let nextUserId: string | null = null;

      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          nextUserId = user.id;

          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          nextRole = (data?.role ?? null) as ProfileRole | null;
        }
      }

      setUserId(nextUserId);
      setRole(nextRole);

      await loadGifts();
      await Promise.all([loadAdminTasks(nextRole), loadPendingGifts(nextRole)]);
    }

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      title={t.market.title}
      intro={t.market.intro}
      loadingTitle={t.market.loadingTitle}
      loadingSubtitle={t.market.loadingSubtitle}
      loadingVariant="market"
      fontVariant="market"
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="hidden h-full w-full bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: `url(${marketBackgrounds.desktop})` }}
        />
        <div
          className="block h-full w-full bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: `url(${marketBackgrounds.mobile})` }}
        />
        <div className="absolute inset-0 bg-amber-950/20" />
      </div>

      <div className="relative z-10">
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-amber-200/10 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-100">
                Market
              </p>
              <h2 className="mt-3 font-market-accent text-3xl font-semibold">
                {page.shelfTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                {page.shelfIntro}
              </p>
            </div>

            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg">
              {gifts.length} ◆
            </div>
          </div>
        </section>

        {canUploadGift ? (
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-md">
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.28em] text-amber-100">
                Gift Request
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {page.requestTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                {page.requestIntro}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_0.6fr_0.5fr_0.8fr]">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestName}
                </span>
                <input
                  value={requestTitle}
                  onChange={(event) => setRequestTitle(event.target.value)}
                  placeholder={page.requestNamePlaceholder}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-200/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestDescription}
                </span>
                <input
                  value={requestDescription}
                  onChange={(event) =>
                    setRequestDescription(event.target.value)
                  }
                  placeholder={page.requestDescriptionPlaceholder}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-200/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestPrice}
                </span>
                <input
                  value={requestPrice}
                  onChange={(event) => setRequestPrice(event.target.value)}
                  inputMode="numeric"
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-amber-200/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestIcon}
                </span>
                <input
                  value={requestIcon}
                  onChange={(event) => setRequestIcon(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-amber-200/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestType}
                </span>
                <select
                  value={requestType}
                  onChange={(event) =>
                    setRequestType(event.target.value as GiftType)
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-amber-200/50"
                >
                  <option value="virtual">
                    {giftTypeCopies[currentLang].virtual}
                  </option>
                  <option value="date_plan">
                    {giftTypeCopies[currentLang].date_plan}
                  </option>
                  <option value="physical">
                    {giftTypeCopies[currentLang].physical}
                  </option>
                </select>
              </label>
            </div>

            {role === "admin" ? (
              <label className="mt-4 grid gap-2">
                <span className="text-sm text-slate-300">
                  {page.requestImage}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) =>
                    setRequestImageFile(event.target.files?.[0] ?? null)
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-amber-100 focus:border-amber-200/50"
                />
                <span className="text-xs text-slate-400">
                  {requestImageFile
                    ? requestImageFile.name
                    : page.requestImageHelp}
                </span>
              </label>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitGiftRequest}
                disabled={isSubmittingRequest}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {role === "admin"
                  ? page.requestSubmitAdmin
                  : page.requestSubmitHeroine}
              </button>

              {requestStatus ? (
                <p className="text-sm text-amber-100">{requestStatus}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {role === "admin" ? (
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-950/35 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{page.adminTodoTitle}</h2>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                {adminTasks.length} {page.adminTodoCount}
              </span>
            </div>

            {reviewStatus ? (
              <p className="mt-3 text-sm text-amber-100">{reviewStatus}</p>
            ) : null}

            {pendingGifts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">
                {page.adminTodoEmpty}
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {pendingGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr_auto] lg:items-end">
                      <div>
                        <p className="font-medium text-white">
                          {currentLang === "cn" ? gift.title_cn : gift.title_en}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          {gift.submitted_at
                            ? formatTaskTime(gift.submitted_at, currentLang)
                            : page.pendingStatus}
                          {" · "}
                          {gift.price} {page.priceUnit}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          {currentLang === "cn"
                            ? gift.description_cn
                            : gift.description_en}
                        </p>
                      </div>

                      <label className="grid gap-2">
                        <span className="text-sm text-slate-300">
                          {page.reviewImageLabel}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(event) =>
                            setReviewImageFiles((current) => ({
                              ...current,
                              [gift.id]: event.target.files?.[0] ?? null,
                            }))
                          }
                          className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-amber-100 focus:border-amber-200/50"
                        />
                        <span className="text-xs text-slate-400">
                          {reviewImageFiles[gift.id]?.name ??
                            page.reviewImageHelp}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleActivateGift(gift.id)}
                        disabled={reviewingGiftId === gift.id}
                        className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {page.reviewActivate}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {role === "heroine" ? (
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-amber-200/10 p-6 shadow-2xl shadow-amber-950/20 backdrop-blur-md">
            <h2 className="text-xl font-semibold">
              {page.heroinePendingTitle}
            </h2>

            {pendingGifts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">
                {page.heroinePendingEmpty}
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {pendingGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {currentLang === "cn" ? gift.title_cn : gift.title_en}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          {gift.submitted_at
                            ? formatTaskTime(gift.submitted_at, currentLang)
                            : page.pendingStatus}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-200/15 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-200/25">
                        {page.pendingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {isLoadingGifts ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-sm text-slate-200 shadow-2xl backdrop-blur-md">
            {page.loading}
          </div>
        ) : giftError ? (
          <div className="rounded-[2rem] border border-rose-200/20 bg-rose-500/10 p-6 text-sm text-rose-100 shadow-2xl backdrop-blur-md">
            {giftError}
          </div>
        ) : gifts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-sm text-slate-200 shadow-2xl backdrop-blur-md">
            {page.empty}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {gifts.map((gift) => {
              const isRedeemed = gift.status === "redeemed";

              return (
                <article
                  key={gift.id}
                  className={[
                    "group relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl backdrop-blur-md transition duration-300",
                    isRedeemed
                      ? "border-white/10 bg-white/5 opacity-75"
                      : "border-white/15 bg-white/10 hover:-translate-y-1 hover:bg-white/15",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-200/20 blur-3xl transition group-hover:bg-amber-200/30" />
                  <div className="pointer-events-none absolute -bottom-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-pink-300/15 blur-3xl" />

                  <div className="relative">
                    <div className="mb-5 grid h-44 place-items-center overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/25 to-white/5 shadow-inner">
                      {gift.imagePath ? (
                        <img
                          src={gift.imagePath}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={[
                            "grid h-24 w-24 place-items-center rounded-[2rem] text-5xl shadow-2xl ring-1 transition duration-300",
                            isRedeemed
                              ? "bg-slate-950/40 text-white/40 ring-white/10"
                              : "bg-white text-amber-600 ring-white/50 group-hover:scale-105",
                          ].join(" ")}
                        >
                          {gift.icon}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">{gift.title}</h2>
                        <p className="mt-2 text-sm text-slate-300">
                          {gift.type}
                        </p>
                      </div>

                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs ring-1",
                          isRedeemed
                            ? "bg-white/10 text-white/50 ring-white/10"
                            : "bg-amber-200/15 text-amber-100 ring-amber-200/25",
                        ].join(" ")}
                      >
                        {isRedeemed ? page.redeemed : page.available}
                      </span>
                    </div>

                    <p className="min-h-12 text-sm leading-6 text-slate-200">
                      {gift.description}
                    </p>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-300">
                          {page.priceLabel}
                        </span>
                        <span className="font-market-accent font-semibold text-amber-200">
                          {gift.price} {page.priceUnit}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-300">
                          {page.statusLabel}
                        </span>
                        <span
                          className={
                            isRedeemed ? "text-white/50" : "text-sky-200"
                          }
                        >
                          {isRedeemed ? page.redeemed : page.available}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isRedeemed || role !== "heroine"}
                      className={[
                        "mt-6 w-full rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed",
                        isRedeemed || role !== "heroine"
                          ? "bg-white/10 text-white/40"
                          : "bg-white text-slate-950 hover:bg-amber-100",
                      ].join(" ")}
                    >
                      {isRedeemed ? page.redeemed : page.redeem}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
