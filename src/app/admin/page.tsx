"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

type GiftType = "virtual" | "physical" | "date_plan";
type StudioMediaType = "image" | "video";
type StudioCategory = "sunlight" | "heartbeat" | "rose" | "bloopers";
type StudioUnlockMode = "always" | "magic_puzzle" | "manual" | "password";
type StudioItemStatus = "active" | "hidden";

type AdminTab = "overview" | "market" | "magic" | "studio" | "activity";
type StudioCategoryFilter = "all" | StudioCategory;
type StudioStatusFilter = "all" | StudioItemStatus;
type AdminTone = "amber" | "violet" | "emerald" | "red" | "stone";

type StudioItemRow = {
  id: string;
  title_cn: string;
  title_en: string;
  description_cn: string | null;
  description_en: string | null;
  teaser_cn: string | null;
  teaser_en: string | null;
  unlocked_note_cn: string | null;
  unlocked_note_en: string | null;
  media_type: StudioMediaType;
  category: StudioCategory;
  unlock_mode: StudioUnlockMode;
  status: StudioItemStatus;
  storage_path: string | null;
  thumbnail_path: string | null;
  required_puzzle_id: string | null;
  required_puzzle_title_cn: string | null;
  required_puzzle_title_en: string | null;
  sort_order: number;
  created_at: string;
  is_unlocked: boolean;
};

type MagicPuzzleStatus = "active" | "hidden";

type MagicPuzzleRow = {
  id: string;
  slug: string;
  title_cn: string;
  title_en: string;
  status: MagicPuzzleStatus;
  publish_at: string;
  reward_energy: number;
  created_at: string;
};

type TreeWriteMode = "everyone" | "signed_in" | "heroine_only" | "closed";

type MessageRow = {
  id: string;
  content: string;
  author_display_name: string | null;
  author_role: ProfileRole | null;
  created_at: string;
  is_hidden: boolean;
  hidden_at: string | null;
};

type EnergyTransactionRow = {
  id: string;
  amount: number;
  transaction_type: string;
  source: string;
  description: string | null;
  created_at: string;
};

const treeWriteModeOptions: {
  value: TreeWriteMode;
  label: string;
  description: string;
}[] = [
  {
    value: "everyone",
    label: "所有人可留言",
    description: "未登录访客、登录用户、小欣和站长都可以留言。",
  },
  {
    value: "signed_in",
    label: "登录后可留言",
    description: "只有登录用户可以留言，未登录访客只能浏览。",
  },
  {
    value: "heroine_only",
    label: "仅小欣可留言",
    description: "只有小欣可以留言，其他人只能浏览。",
  },
  {
    value: "closed",
    label: "关闭留言",
    description: "所有人都不能新增留言，只保留公开浏览。",
  },
];

function formatDateTime(value: string | null) {
  if (!value) return "未设置";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTorontoTime(value: string | null) {
  if (!value) return "未设置";

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "America/Toronto",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBeijingTime(value: string | null) {
  if (!value) return "未设置";

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDatetimeLocalInputValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

const adminTabs: { id: AdminTab; label: string; description: string }[] = [
  {
    id: "overview",
    label: "总览",
    description: "查看关键状态和最近变动",
  },
  {
    id: "market",
    label: "礼物市场",
    description: "发布礼物、审核需求、管理兑换",
  },
  {
    id: "magic",
    label: "魔法谜题",
    description: "创建谜题和查看上线状态",
  },
  {
    id: "studio",
    label: "记忆暗房",
    description: "上传、编辑、隐藏和删除暗房内容",
  },
  {
    id: "activity",
    label: "最近动态",
    description: "查看留言和星光值流水",
  },
];

function getStudioCategoryLabel(category: StudioCategory) {
  if (category === "sunlight") return "日光底片";
  if (category === "heartbeat") return "心跳短片";
  if (category === "rose") return "玫瑰暗格";
  return "笨蛋花絮";
}

function getStudioUnlockModeLabel(mode: StudioUnlockMode) {
  if (mode === "always") return "默认开放";
  if (mode === "magic_puzzle") return "Magic 谜题解锁";
  if (mode === "manual") return "手动解锁";
  return "密码解锁";
}

function getStudioStatusLabel(status: StudioItemStatus) {
  return status === "active" ? "开放中" : "已隐藏";
}

const toneTextClasses: Record<AdminTone, string> = {
  amber: "text-amber-100",
  violet: "text-violet-100",
  emerald: "text-emerald-100",
  red: "text-red-100",
  stone: "text-stone-100",
};

const toneEyebrowClasses: Record<AdminTone, string> = {
  amber: "text-amber-200/80",
  violet: "text-violet-200/80",
  emerald: "text-emerald-200/80",
  red: "text-red-200/80",
  stone: "text-stone-300",
};

const toneBorderClasses: Record<AdminTone, string> = {
  amber: "border-amber-200/40",
  violet: "border-violet-200/40",
  emerald: "border-emerald-200/40",
  red: "border-red-200/40",
  stone: "border-white/10",
};

const toneButtonClasses: Record<AdminTone, string> = {
  amber:
    "border-amber-200/40 bg-amber-100/10 text-amber-100 hover:bg-amber-100/20",
  violet:
    "border-violet-200/40 bg-violet-100/10 text-violet-100 hover:bg-violet-100/20",
  emerald:
    "border-emerald-200/40 bg-emerald-100/10 text-emerald-100 hover:bg-emerald-100/20",
  red: "border-red-200/40 bg-red-100/10 text-red-100 hover:bg-red-100/20",
  stone: "border-white/10 bg-white/10 text-stone-100 hover:bg-white/15",
};

const toneFocusClasses: Record<AdminTone, string> = {
  amber: "focus:border-amber-200/50",
  violet: "focus:border-violet-200/50",
  emerald: "focus:border-emerald-200/50",
  red: "focus:border-red-200/50",
  stone: "focus:border-white/30",
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  const [accessStatus, setAccessStatus] = useState<AccessStatus>("loading");
  const [displayName, setDisplayName] = useState("站长");
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeAdminTab, setActiveAdminTab] =
    useState<AdminTab>("overview");
  const [studioCategoryFilter, setStudioCategoryFilter] =
    useState<StudioCategoryFilter>("all");
  const [studioStatusFilter, setStudioStatusFilter] =
    useState<StudioStatusFilter>("all");

  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  
  const [arrivalInputs, setArrivalInputs] = useState<Record<string, string>>({});
  const [savingArrivalId, setSavingArrivalId] = useState<string | null>(null);
  const [arrivalStatus, setArrivalStatus] = useState("");

  const [reviewImageFiles, setReviewImageFiles] = useState<
    Record<string, File | null>
    >({});
  const [reviewingGiftId, setReviewingGiftId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageManageStatus, setMessageManageStatus] = useState("");
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [treeMessageWriteMode, setTreeMessageWriteMode] =
    useState<TreeWriteMode>("heroine_only");
  const [treeMessageSettingStatus, setTreeMessageSettingStatus] = useState("");
  const [isSavingTreeMessageSetting, setIsSavingTreeMessageSetting] =
    useState(false);
  const [energyTransactions, setEnergyTransactions] = useState<
    EnergyTransactionRow[]
  >([]);

  const [newGiftTitle, setNewGiftTitle] = useState("");
  const [newGiftDescription, setNewGiftDescription] = useState("");
  const [newGiftPrice, setNewGiftPrice] = useState("1");
  const [newGiftIcon, setNewGiftIcon] = useState("◆");
  const [newGiftType, setNewGiftType] = useState<GiftType>("virtual");
  const [newGiftImageFile, setNewGiftImageFile] = useState<File | null>(null);
  const [isPublishingGift, setIsPublishingGift] = useState(false);
  const [publishGiftStatus, setPublishGiftStatus] = useState("");
  
  const [magicSlug, setMagicSlug] = useState("");
  const [magicTitle, setMagicTitle] = useState("");
  const [magicRiddle, setMagicRiddle] = useState("");
  const [magicHint, setMagicHint] = useState("");
  const [magicUnlockNote, setMagicUnlockNote] = useState("");
  const [magicAnswer, setMagicAnswer] = useState("");
  const [magicStatus, setMagicStatus] = useState<MagicPuzzleStatus>("active");
  const [magicPublishAt, setMagicPublishAt] = useState(
    toDatetimeLocalInputValue(new Date().toISOString()),
  );
  const [magicRewardEnergy, setMagicRewardEnergy] = useState("3");
  const [magicSurpriseTitle, setMagicSurpriseTitle] = useState("");
  const [magicSurpriseNote, setMagicSurpriseNote] = useState("");
  const [isCreatingMagicPuzzle, setIsCreatingMagicPuzzle] = useState(false);
  const [magicPuzzleStatus, setMagicPuzzleStatus] = useState("");
  const [recentMagicPuzzles, setRecentMagicPuzzles] = useState<MagicPuzzleRow[]>(
    [],
  );
  const [magicTeaser, setMagicTeaser] = useState("");
  const [studioTitle, setStudioTitle] = useState("");
  const [studioDescription, setStudioDescription] = useState("");
  const [studioTeaser, setStudioTeaser] = useState("");
  const [studioUnlockedNote, setStudioUnlockedNote] = useState("");
  const [studioCategory, setStudioCategory] =
    useState<StudioCategory>("sunlight");
  const [studioUnlockMode, setStudioUnlockMode] =
    useState<StudioUnlockMode>("always");
  const [studioRequiredPuzzleId, setStudioRequiredPuzzleId] = useState("");
  const [studioSortOrder, setStudioSortOrder] = useState("0");
  const [studioImageFile, setStudioImageFile] = useState<File | null>(null);
  const [isCreatingStudioItem, setIsCreatingStudioItem] = useState(false);
  const [studioItemStatus, setStudioItemStatus] = useState("");
  const [recentStudioItems, setRecentStudioItems] = useState<StudioItemRow[]>([]);

  const [editingStudioItemId, setEditingStudioItemId] = useState<string | null>(
    null,
  );
  const [editStudioTitle, setEditStudioTitle] = useState("");
  const [editStudioDescription, setEditStudioDescription] = useState("");
  const [editStudioTeaser, setEditStudioTeaser] = useState("");
  const [editStudioUnlockedNote, setEditStudioUnlockedNote] = useState("");
  const [editStudioCategory, setEditStudioCategory] =
    useState<StudioCategory>("sunlight");
  const [editStudioUnlockMode, setEditStudioUnlockMode] =
    useState<StudioUnlockMode>("always");
  const [editStudioRequiredPuzzleId, setEditStudioRequiredPuzzleId] =
    useState("");
  const [editStudioSortOrder, setEditStudioSortOrder] = useState("0");
  const [editStudioStatus, setEditStudioStatus] =
    useState<StudioItemStatus>("active");
  const [savingStudioItemId, setSavingStudioItemId] = useState<string | null>(
    null,
  );
  const [deletingStudioItemId, setDeletingStudioItemId] = useState<string | null>(
    null,
  );
  const [studioManageStatus, setStudioManageStatus] = useState("");
  
  async function uploadGiftImage(file: File, giftId: string) {
    const rawExtension = file.name.split(".").pop() ?? "png";
    const safeExtension =
        rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";

    const filePath = `gift-requests/${giftId}-${Date.now()}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
        .from("gift-images")
        .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from("gift-images").getPublicUrl(filePath);

    return data.publicUrl;
    }

  async function uploadStudioMedia(file: File, userId: string) {
    const rawExtension = file.name.split(".").pop() ?? "png";
    const safeExtension =
        rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";

    const folder = file.type.startsWith("video/") ? "videos" : "images";
    const randomPart = Math.random().toString(36).slice(2);
    const filePath = `${folder}/${userId}/${Date.now()}-${randomPart}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
        .from("studio-media")
        .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        });

    if (uploadError) {
        throw uploadError;
    }

    return filePath;
  }

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
        loadTreeMessageSettings(),
        loadRecentMessages(),
        loadRecentEnergyTransactions(),
        loadRecentMagicPuzzles(),
        loadRecentStudioItems(),
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

  async function handleActivateGift(giftId: string) {
    const imageFile = reviewImageFiles[giftId];

    if (!imageFile) {
        setReviewStatus("请先选择礼物图片。");
        return;
    }

    setReviewingGiftId(giftId);
    setReviewStatus("正在上传图片并上架……");

    let imagePublicUrl = "";

    try {
        imagePublicUrl = await uploadGiftImage(imageFile, giftId);
    } catch (uploadError) {
        setReviewStatus(
        `图片上传失败：${
            uploadError instanceof Error ? uploadError.message : "Unknown error"
        }`,
        );
        setReviewingGiftId(null);
        return;
    }

    const { error } = await supabase.rpc("approve_gift_request", {
        gift_id_input: giftId,
        image_path_input: imagePublicUrl,
    });

    if (error) {
        setReviewStatus(`审核上架失败：${error.message}`);
        setReviewingGiftId(null);
        return;
    }

    setReviewImageFiles((current) => ({
        ...current,
        [giftId]: null,
    }));

    setReviewStatus("礼物已审核上架。");
    setReviewingGiftId(null);

    await Promise.all([
        loadPendingGifts(),
        loadRecentRedemptions(),
        loadRecentEnergyTransactions(),
    ]);
    }

  async function handlePublishGift() {
    const title = newGiftTitle.trim();
    const description = newGiftDescription.trim();
    const parsedPrice = Number(newGiftPrice);
    const icon = newGiftIcon.trim() || "◆";

    if (!title || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setPublishGiftStatus("请填写礼物标题和有效星光值价格。");
      return;
    }

    setIsPublishingGift(true);
    setPublishGiftStatus("正在发布礼物……");

    try {
      const { data: createdGiftId, error } = await supabase.rpc(
        "create_market_gift",
        {
          title_input: title,
          description_input: description || title,
          price_input: Math.round(parsedPrice),
          icon_input: icon.slice(0, 8),
          gift_type_input: newGiftType,
        },
      );

      if (error || !createdGiftId) {
        setPublishGiftStatus(
          `发布失败：${error?.message ?? "No gift id returned"}`,
        );
        return;
      }

      if (newGiftImageFile) {
        const imagePublicUrl = await uploadGiftImage(
          newGiftImageFile,
          createdGiftId,
        );

        const { error: updateImageError } = await supabase
          .from("gifts")
          .update({ image_path: imagePublicUrl })
          .eq("id", createdGiftId);

        if (updateImageError) {
          setPublishGiftStatus(`图片保存失败：${updateImageError.message}`);
          return;
        }
      }

      setNewGiftTitle("");
      setNewGiftDescription("");
      setNewGiftPrice("1");
      setNewGiftIcon("◆");
      setNewGiftType("virtual");
      setNewGiftImageFile(null);

      setPublishGiftStatus("礼物已直接发布到市场。");

      await Promise.all([
        loadPendingGifts(),
        loadRecentRedemptions(),
        loadRecentEnergyTransactions(),
      ]);
    } catch (publishError) {
      setPublishGiftStatus(
        `发布失败：${
          publishError instanceof Error ? publishError.message : "Unknown error"
        }`,
      );
    } finally {
      setIsPublishingGift(false);
    }
  }

  async function handleCreateMagicPuzzle() {
    const title = magicTitle.trim();
    const riddle = magicRiddle.trim();
    const answer = magicAnswer.trim();
    const parsedRewardEnergy = Number(magicRewardEnergy);

    if (!title || !riddle || !answer) {
        setMagicPuzzleStatus("请填写标题、谜题正文和答案。");
        return;
    }

    setIsCreatingMagicPuzzle(true);
    setMagicPuzzleStatus("正在创建魔法谜题……");

    const publishAtIso = magicPublishAt
        ? new Date(magicPublishAt).toISOString()
        : null;

    const { error } = await supabase.rpc("create_magic_puzzle", {
        slug_input: magicSlug.trim(),
        title_input: title,
        teaser_input: magicTeaser.trim(),
        riddle_input: riddle,
        hint_input: magicHint.trim(),
        unlock_note_input: magicUnlockNote.trim(),
        answer_input: answer,
        status_input: magicStatus,
        publish_at_input: publishAtIso,
        reward_energy_input: Number.isFinite(parsedRewardEnergy)
            ? Math.max(0, Math.round(parsedRewardEnergy))
            : 3,
        surprise_title_input: magicSurpriseTitle.trim(),
        surprise_note_input: magicSurpriseNote.trim(),
    });

    if (error) {
        setMagicPuzzleStatus(`创建失败：${error.message}`);
        setIsCreatingMagicPuzzle(false);
        return;
    }

    setMagicSlug("");
    setMagicTitle("");
    setMagicRiddle("");
    setMagicTeaser("");
    setMagicHint("");
    setMagicUnlockNote("");
    setMagicAnswer("");
    setMagicStatus("active");
    setMagicPublishAt(toDatetimeLocalInputValue(new Date().toISOString()));
    setMagicPuzzleStatus("魔法谜题已创建。");
    setMagicRewardEnergy("3");
    setMagicSurpriseTitle("");
    setMagicSurpriseNote("");

    await loadRecentMagicPuzzles();

    setIsCreatingMagicPuzzle(false);
  }

  async function handleCreateStudioItem() {
    const title = studioTitle.trim();
    const description = studioDescription.trim();
    const teaser = studioTeaser.trim();
    const unlockedNote = studioUnlockedNote.trim();
    const parsedSortOrder = Number(studioSortOrder);

    if (!title) {
        setStudioItemStatus("请填写暗房内容标题。");
        return;
    }

    if (!studioImageFile) {
        setStudioItemStatus("请先选择一张图片。");
        return;
    }

    if (studioUnlockMode === "magic_puzzle" && !studioRequiredPuzzleId) {
        setStudioItemStatus("Magic 解锁内容需要绑定一个谜题。");
        return;
    }

    setIsCreatingStudioItem(true);
    setStudioItemStatus("正在上传暗房内容……");

    try {
        const {
        data: { user },
        error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
        setStudioItemStatus(`上传失败：${userError?.message ?? "请先登录。"}`);
        return;
        }

        const storagePath = await uploadStudioMedia(studioImageFile, user.id);

        const studioMediaType: StudioMediaType = studioImageFile.type.startsWith(
            "video/",
            )
            ? "video"
            : "image";

        const { error } = await supabase.rpc("create_studio_item", {
            title_input: title,
            description_input: description,
            teaser_input: teaser,
            unlocked_note_input: unlockedNote,
            media_type_input: studioMediaType,
            category_input: studioCategory,
            unlock_mode_input: studioUnlockMode,
            required_puzzle_id_input:
                studioUnlockMode === "magic_puzzle" ? studioRequiredPuzzleId : null,
            storage_path_input: storagePath,
            thumbnail_path_input: null,
            sort_order_input: Number.isFinite(parsedSortOrder)
                ? Math.round(parsedSortOrder)
                : 0,
        });

        if (error) {
        setStudioItemStatus(`创建失败：${error.message}`);
        return;
        }

        setStudioTitle("");
        setStudioDescription("");
        setStudioTeaser("");
        setStudioUnlockedNote("");
        setStudioCategory("sunlight");
        setStudioUnlockMode("always");
        setStudioRequiredPuzzleId("");
        setStudioSortOrder("0");
        setStudioImageFile(null);
        setStudioItemStatus("暗房内容已创建。");

        await loadRecentStudioItems();
    } catch (createError) {
        setStudioItemStatus(
        `创建失败：${
            createError instanceof Error ? createError.message : "Unknown error"
        }`,
        );
    } finally {
        setIsCreatingStudioItem(false);
    }
  }

  function startEditStudioItem(item: StudioItemRow) {
    setEditingStudioItemId(item.id);
    setEditStudioTitle(item.title_cn);
    setEditStudioDescription(item.description_cn ?? "");
    setEditStudioTeaser(item.teaser_cn ?? "");
    setEditStudioUnlockedNote(item.unlocked_note_cn ?? "");
    setEditStudioCategory(item.category);
    setEditStudioUnlockMode(item.unlock_mode);
    setEditStudioRequiredPuzzleId(item.required_puzzle_id ?? "");
    setEditStudioSortOrder(String(item.sort_order ?? 0));
    setEditStudioStatus(item.status);
    setStudioManageStatus("");
  }

  function cancelEditStudioItem() {
    setEditingStudioItemId(null);
    setStudioManageStatus("");
  }

  async function handleUpdateStudioItem() {
    if (!editingStudioItemId) return;

    const title = editStudioTitle.trim();
    const parsedSortOrder = Number(editStudioSortOrder);

    if (!title) {
        setStudioManageStatus("请填写暗房内容标题。");
        return;
    }

    if (editStudioUnlockMode === "magic_puzzle" && !editStudioRequiredPuzzleId) {
        setStudioManageStatus("Magic 解锁内容需要绑定一个谜题。");
        return;
    }

    setSavingStudioItemId(editingStudioItemId);
    setStudioManageStatus("正在保存暗房内容……");

    const { error } = await supabase.rpc("update_studio_item", {
        studio_item_id_input: editingStudioItemId,
        title_input: title,
        description_input: editStudioDescription.trim(),
        teaser_input: editStudioTeaser.trim(),
        unlocked_note_input: editStudioUnlockedNote.trim(),
        category_input: editStudioCategory,
        unlock_mode_input: editStudioUnlockMode,
        required_puzzle_id_input:
        editStudioUnlockMode === "magic_puzzle"
            ? editStudioRequiredPuzzleId
            : null,
        sort_order_input: Number.isFinite(parsedSortOrder)
        ? Math.round(parsedSortOrder)
        : 0,
        status_input: editStudioStatus,
    });

    if (error) {
        setStudioManageStatus(`保存失败：${error.message}`);
        setSavingStudioItemId(null);
        return;
    }

    setStudioManageStatus("暗房内容已保存。");
    setSavingStudioItemId(null);
    setEditingStudioItemId(null);

    await loadRecentStudioItems();
  }

  async function handleSetStudioItemStatus(
    item: StudioItemRow,
    nextStatus: StudioItemStatus,
    ) {
    setSavingStudioItemId(item.id);
    setStudioManageStatus(
        nextStatus === "hidden" ? "正在隐藏暗房内容……" : "正在恢复暗房内容……",
    );

    const { error } = await supabase.rpc("set_studio_item_status", {
        studio_item_id_input: item.id,
        status_input: nextStatus,
    });

    if (error) {
        setStudioManageStatus(`状态更新失败：${error.message}`);
        setSavingStudioItemId(null);
        return;
    }

    setStudioManageStatus(nextStatus === "hidden" ? "已隐藏。" : "已恢复开放。");
    setSavingStudioItemId(null);

    await loadRecentStudioItems();
  }

  async function handleDeleteStudioItem(item: StudioItemRow) {
    const confirmed = window.confirm(
        `确认永久删除「${item.title_cn}」吗？这会从暗房列表移除该内容。`,
    );

    if (!confirmed) return;

    setDeletingStudioItemId(item.id);
    setStudioManageStatus("正在删除暗房内容……");

    const { data, error } = await supabase.rpc("delete_studio_item", {
        studio_item_id_input: item.id,
    });

    if (error) {
        setStudioManageStatus(`删除失败：${error.message}`);
        setDeletingStudioItemId(null);
        return;
    }

    const deletedRow = Array.isArray(data) ? data[0] : null;
    const pathsToRemove = [
        deletedRow?.deleted_storage_path,
        deletedRow?.deleted_thumbnail_path,
    ].filter(Boolean) as string[];

    if (pathsToRemove.length > 0) {
        const { error: removeError } = await supabase.storage
        .from("studio-media")
        .remove(pathsToRemove);

        if (removeError) {
          setStudioManageStatus(
             `内容记录已删除，但素材文件删除失败：${removeError.message}`,
          );
          setDeletingStudioItemId(null);
          await loadRecentStudioItems();
          return;
        }
    }

    setStudioManageStatus("暗房内容已删除。");
    setDeletingStudioItemId(null);

    await loadRecentStudioItems();
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
      setArrivalInputs({});
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

    const nextRedemptions = rows.map((row) => ({
      ...row,
      giftTitle: giftTitleMap.get(row.gift_id) ?? "未知礼物",
    }));

    setRedemptions(nextRedemptions);

    setArrivalInputs((current) => {
      const nextInputs = { ...current };

      nextRedemptions.forEach((redemption) => {
        if (
          redemption.status === "pending_receipt" &&
          nextInputs[redemption.id] === undefined
        ) {
          nextInputs[redemption.id] = toDatetimeLocalInputValue(
            redemption.expected_arrival_at,
          );
        }
      });

      return nextInputs;
    });
  }

  async function handleSaveArrival(redemptionId: string) {
    const arrivalValue = arrivalInputs[redemptionId];

    if (!arrivalValue) {
      setArrivalStatus("请先填写预计到货时间。");
      return;
    }

    setSavingArrivalId(redemptionId);
    setArrivalStatus("正在保存预计到货时间……");

    const { error } = await supabase.rpc("set_redemption_arrival", {
      redemption_id_input: redemptionId,
      expected_arrival_at_input: new Date(arrivalValue).toISOString(),
    });

    if (error) {
      setArrivalStatus(`保存失败：${error.message}`);
      setSavingArrivalId(null);
      return;
    }

    setArrivalStatus("预计到货时间已保存。");
    setSavingArrivalId(null);

    await loadRecentRedemptions();
  }

  async function loadTreeMessageSettings() {
    const { data, error } = await supabase.rpc("get_tree_message_settings");

    if (error) {
        setErrorMessage(error.message);
        return;
    }

    const nextMode = data?.[0]?.write_mode as TreeWriteMode | undefined;
    setTreeMessageWriteMode(nextMode ?? "heroine_only");
  }

  async function handleTreeMessageWriteModeChange(nextMode: TreeWriteMode) {
    setIsSavingTreeMessageSetting(true);
    setTreeMessageSettingStatus("正在保存留言权限……");

    const { data, error } = await supabase.rpc("set_tree_message_write_mode", {
        write_mode_input: nextMode,
    });

    if (error) {
        setTreeMessageSettingStatus(`保存失败：${error.message}`);
        setIsSavingTreeMessageSetting(false);
        return;
    }

    const savedMode = data?.[0]?.write_mode as TreeWriteMode | undefined;

    setTreeMessageWriteMode(savedMode ?? nextMode);
    setTreeMessageSettingStatus("留言权限已保存。");
    setIsSavingTreeMessageSetting(false);
  }

  async function handleToggleMessageHidden(message: MessageRow) {
    setUpdatingMessageId(message.id);
    setMessageManageStatus(message.is_hidden ? "正在恢复留言……" : "正在隐藏留言……");

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("messages")
        .update({
        is_hidden: !message.is_hidden,
        hidden_at: message.is_hidden ? null : new Date().toISOString(),
        hidden_by: message.is_hidden ? null : user?.id ?? null,
        })
        .eq("id", message.id);

    if (error) {
        setMessageManageStatus(`操作失败：${error.message}`);
        setUpdatingMessageId(null);
        return;
    }

    setMessageManageStatus(message.is_hidden ? "留言已恢复显示。" : "留言已隐藏。");
    setUpdatingMessageId(null);
    await loadRecentMessages();
  }

  async function handleDeleteMessage(message: MessageRow) {
    const confirmed = window.confirm("确定永久删除这条留言吗？此操作不可恢复。");

    if (!confirmed) return;

    setUpdatingMessageId(message.id);
    setMessageManageStatus("正在删除留言……");

    const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", message.id);

    if (error) {
        setMessageManageStatus(`删除失败：${error.message}`);
        setUpdatingMessageId(null);
        return;
    }

    setMessageManageStatus("留言已删除。");
    setUpdatingMessageId(null);
    await loadRecentMessages();
  }

  async function loadRecentMessages() {
    const { data, error } = await supabase
        .from("messages")
        .select(
            "id, content, author_display_name, author_role, created_at, is_hidden, hidden_at",
        )
        .order("created_at", { ascending: false })
        .limit(20);

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

  async function loadRecentMagicPuzzles() {
    const { data, error } = await supabase
        .from("magic_puzzles")
        .select("id, slug, title_cn, status, publish_at, reward_energy, created_at")
        .order("publish_at", { ascending: false })
        .limit(30);

    if (error) {
        setErrorMessage(error.message);
        return;
    }

    setRecentMagicPuzzles((data ?? []) as MagicPuzzleRow[]);
  }

  async function loadRecentStudioItems() {
    const { data, error } = await supabase.rpc("get_studio_items");

    if (error) {
        setErrorMessage(error.message);
        return;
    }

    setRecentStudioItems((data ?? []) as StudioItemRow[]);
  }

  useEffect(() => {
    void loadAdminDashboard();
  }, []);

  const activeStudioCount = recentStudioItems.filter(
  (item) => item.status === "active",
).length;
const hiddenStudioCount = recentStudioItems.filter(
  (item) => item.status === "hidden",
).length;
const activeMagicCount = recentMagicPuzzles.filter(
  (puzzle) => puzzle.status === "active",
).length;
const hiddenMagicCount = recentMagicPuzzles.filter(
  (puzzle) => puzzle.status === "hidden",
).length;
const pendingReceiptCount = redemptions.filter(
  (redemption) => redemption.status === "pending_receipt",
).length;
const recentEnergyNetAmount = energyTransactions.reduce(
  (total, transaction) => total + transaction.amount,
  0,
);

const filteredStudioItems = recentStudioItems.filter((item) => {
  const categoryMatched =
    studioCategoryFilter === "all" || item.category === studioCategoryFilter;
  const statusMatched =
    studioStatusFilter === "all" || item.status === studioStatusFilter;

  return categoryMatched && statusMatched;
});

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
          <nav className="mt-6 flex flex-wrap gap-2">
            {adminTabs.map((tab) => {
                const active = activeAdminTab === tab.id;

                return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAdminTab(tab.id)}
                    className={[
                    "rounded-full border px-4 py-2 text-sm transition",
                    active
                        ? "border-amber-200/50 bg-amber-100/15 text-amber-100"
                        : "border-white/10 bg-black/20 text-stone-300 hover:bg-white/10",
                    ].join(" ")}
                >
                    {tab.label}
                </button>
                );
            })}
          </nav>

            <p className="mt-3 text-sm text-stone-500">
            {adminTabs.find((tab) => tab.id === activeAdminTab)?.description}
            </p>
        </section>

        {activeAdminTab === "overview" ? (
            <OverviewDashboard
                pendingGiftsCount={pendingGifts.length}
                pendingReceiptCount={pendingReceiptCount}
                activeMagicCount={activeMagicCount}
                hiddenMagicCount={hiddenMagicCount}
                totalStudioCount={recentStudioItems.length}
                activeStudioCount={activeStudioCount}
                hiddenStudioCount={hiddenStudioCount}
                messages={messages}
                recentEnergyNetAmount={recentEnergyNetAmount}
                energyTransactionCount={energyTransactions.length}
                onSelectTab={setActiveAdminTab}
            />
        ) : null}

        {activeAdminTab === "market" ? (
            <AdminSection
                eyebrow="Market"
                title="礼物市场管理"
                intro="发布礼物、审核礼物需求，并设置兑换记录的预计到货时间。"
                tone="amber"
            >
                <MarketPublishForm
                    title={newGiftTitle}
                    description={newGiftDescription}
                    price={newGiftPrice}
                    icon={newGiftIcon}
                    giftType={newGiftType}
                    imageFile={newGiftImageFile}
                    isPublishing={isPublishingGift}
                    statusMessage={publishGiftStatus}
                    onTitleChange={setNewGiftTitle}
                    onDescriptionChange={setNewGiftDescription}
                    onPriceChange={setNewGiftPrice}
                    onIconChange={setNewGiftIcon}
                    onGiftTypeChange={setNewGiftType}
                    onImageFileChange={setNewGiftImageFile}
                    onPublish={() => void handlePublishGift()}
                />

                <MarketManagePanel
                    pendingGifts={pendingGifts}
                    redemptions={redemptions}
                    reviewStatus={reviewStatus}
                    arrivalStatus={arrivalStatus}
                    reviewImageFiles={reviewImageFiles}
                    reviewingGiftId={reviewingGiftId}
                    savingArrivalId={savingArrivalId}
                    arrivalInputs={arrivalInputs}
                    onReviewImageChange={(giftId, file) =>
                        setReviewImageFiles((current) => ({
                            ...current,
                            [giftId]: file,
                        }))
                    }
                    onActivateGift={(giftId) => void handleActivateGift(giftId)}
                    onArrivalChange={(redemptionId, value) =>
                        setArrivalInputs((current) => ({
                            ...current,
                            [redemptionId]: value,
                        }))
                    }
                    onSaveArrival={(redemptionId) => void handleSaveArrival(redemptionId)}
                />
            </AdminSection>
            ) : null}

        {activeAdminTab === "magic" ? (
            <AdminSection
                eyebrow="Magic Puzzle"
                title="创建魔法谜题"
                intro="谜题会按上线时间出现在魔法空间。未到时间时，水晶球会保持沉睡。"
                tone="violet"
            >
                <MagicCreateForm
                    slug={magicSlug}
                    title={magicTitle}
                    teaser={magicTeaser}
                    riddle={magicRiddle}
                    hint={magicHint}
                    unlockNote={magicUnlockNote}
                    answer={magicAnswer}
                    status={magicStatus}
                    publishAt={magicPublishAt}
                    rewardEnergy={magicRewardEnergy}
                    surpriseTitle={magicSurpriseTitle}
                    surpriseNote={magicSurpriseNote}
                    isCreating={isCreatingMagicPuzzle}
                    statusMessage={magicPuzzleStatus}
                    onSlugChange={setMagicSlug}
                    onTitleChange={setMagicTitle}
                    onTeaserChange={setMagicTeaser}
                    onRiddleChange={setMagicRiddle}
                    onHintChange={setMagicHint}
                    onUnlockNoteChange={setMagicUnlockNote}
                    onAnswerChange={setMagicAnswer}
                    onStatusChange={setMagicStatus}
                    onPublishAtChange={setMagicPublishAt}
                    onRewardEnergyChange={setMagicRewardEnergy}
                    onSurpriseTitleChange={setMagicSurpriseTitle}
                    onSurpriseNoteChange={setMagicSurpriseNote}
                    onCreate={() => void handleCreateMagicPuzzle()}
                />

                <MagicPuzzleList puzzles={recentMagicPuzzles} />
            </AdminSection>
        ) : null}

        {activeAdminTab === "studio" ? (
            <AdminSection
                eyebrow="Studio Item"
                title="创建记忆暗房内容"
                intro="上传图片或短视频，并设置它是默认开放，还是由某个 Magic 谜题解锁。"
                tone="amber"
            >

                <StudioCreateForm
                    title={studioTitle}
                    description={studioDescription}
                    teaser={studioTeaser}
                    unlockedNote={studioUnlockedNote}
                    category={studioCategory}
                    unlockMode={studioUnlockMode}
                    requiredPuzzleId={studioRequiredPuzzleId}
                    sortOrder={studioSortOrder}
                    imageFile={studioImageFile}
                    recentMagicPuzzles={recentMagicPuzzles}
                    isCreating={isCreatingStudioItem}
                    statusMessage={studioItemStatus}
                    onTitleChange={setStudioTitle}
                    onDescriptionChange={setStudioDescription}
                    onTeaserChange={setStudioTeaser}
                    onUnlockedNoteChange={setStudioUnlockedNote}
                    onCategoryChange={setStudioCategory}
                    onUnlockModeChange={setStudioUnlockMode}
                    onRequiredPuzzleIdChange={setStudioRequiredPuzzleId}
                    onSortOrderChange={setStudioSortOrder}
                    onImageFileChange={setStudioImageFile}
                    onCreate={() => void handleCreateStudioItem()}
                />

                <StudioManagePanel
                    items={recentStudioItems}
                    filteredItems={filteredStudioItems}
                    categoryFilter={studioCategoryFilter}
                    statusFilter={studioStatusFilter}
                    manageStatus={studioManageStatus}
                    recentMagicPuzzles={recentMagicPuzzles}
                    editingItemId={editingStudioItemId}
                    savingItemId={savingStudioItemId}
                    deletingItemId={deletingStudioItemId}
                    editState={{
                        title: editStudioTitle,
                        description: editStudioDescription,
                        teaser: editStudioTeaser,
                        unlockedNote: editStudioUnlockedNote,
                        category: editStudioCategory,
                        unlockMode: editStudioUnlockMode,
                        requiredPuzzleId: editStudioRequiredPuzzleId,
                        sortOrder: editStudioSortOrder,
                        status: editStudioStatus,
                        setTitle: setEditStudioTitle,
                        setDescription: setEditStudioDescription,
                        setTeaser: setEditStudioTeaser,
                        setUnlockedNote: setEditStudioUnlockedNote,
                        setCategory: setEditStudioCategory,
                        setUnlockMode: setEditStudioUnlockMode,
                        setRequiredPuzzleId: setEditStudioRequiredPuzzleId,
                        setSortOrder: setEditStudioSortOrder,
                        setStatus: setEditStudioStatus,
                    }}
                    onCategoryFilterChange={setStudioCategoryFilter}
                    onStatusFilterChange={setStudioStatusFilter}
                    onStartEdit={startEditStudioItem}
                    onSetStatus={(item, nextStatus) =>
                        void handleSetStudioItemStatus(item, nextStatus)
                    }
                    onDelete={(item) => void handleDeleteStudioItem(item)}
                    onSaveEdit={() => void handleUpdateStudioItem()}
                    onCancelEdit={cancelEditStudioItem}
                />
            </AdminSection>
        ) : null}

        {activeAdminTab === "activity" ? (
            <ActivityPanel
                messages={messages}
                energyTransactions={energyTransactions}
                treeMessageWriteMode={treeMessageWriteMode}
                treeMessageSettingStatus={treeMessageSettingStatus}
                isSavingTreeMessageSetting={isSavingTreeMessageSetting}
                messageManageStatus={messageManageStatus}
                updatingMessageId={updatingMessageId}
                onTreeMessageWriteModeChange={(nextMode) =>
                    void handleTreeMessageWriteModeChange(nextMode)
                }
                onToggleMessageHidden={(message) => void handleToggleMessageHidden(message)}
                onDeleteMessage={(message) => void handleDeleteMessage(message)}
            />
        ) : null}
      </div>
    </main>
  );
}

function AdminSection({
  eyebrow,
  title,
  intro,
  tone = "amber",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: AdminTone;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
      <div className="flex flex-col gap-2">
        <p
          className={[
            "text-sm uppercase tracking-[0.3em]",
            toneEyebrowClasses[tone],
          ].join(" ")}
        >
          {eyebrow}
        </p>
        <h2 className="text-xl font-semibold">{title}</h2>
        {intro ? <p className="text-sm text-stone-400">{intro}</p> : null}
      </div>

      {children}
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  help,
  tone = "amber",
  spanFull = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  help?: string;
  tone?: AdminTone;
  spanFull?: boolean;
}) {
  return (
    <label className={["grid gap-2", spanFull ? "md:col-span-2" : ""].join(" ")}>
      <span className="text-sm text-stone-300">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none",
          toneFocusClasses[tone],
        ].join(" ")}
        placeholder={placeholder}
      />
      {help ? <span className="text-xs text-stone-500">{help}</span> : null}
    </label>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  help,
  tone = "amber",
  spanFull = true,
  minHeightClass = "min-h-20",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  tone?: AdminTone;
  spanFull?: boolean;
  minHeightClass?: string;
}) {
  return (
    <label className={["grid gap-2", spanFull ? "md:col-span-2" : ""].join(" ")}>
      <span className="text-sm text-stone-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          minHeightClass,
          "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none",
          toneFocusClasses[tone],
        ].join(" ")}
        placeholder={placeholder}
      />
      {help ? <span className="text-xs text-stone-500">{help}</span> : null}
    </label>
  );
}

function FormSelect<T extends string>({
  label,
  value,
  onChange,
  children,
  help,
  tone = "amber",
  spanFull = false,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
  help?: string;
  tone?: AdminTone;
  spanFull?: boolean;
}) {
  return (
    <label className={["grid gap-2", spanFull ? "md:col-span-2" : ""].join(" ")}>
      <span className="text-sm text-stone-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={[
          "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none",
          toneFocusClasses[tone],
        ].join(" ")}
      >
        {children}
      </select>
      {help ? <span className="text-xs text-stone-500">{help}</span> : null}
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  tone = "amber",
  compact = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: AdminTone;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-full border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        compact ? "px-3 py-1 text-xs" : "px-5 py-3",
        toneButtonClasses[tone],
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatusLine({
  message,
  tone = "amber",
}: {
  message: string;
  tone?: AdminTone;
}) {
  if (!message) return null;

  return (
    <p className={["text-sm", toneTextClasses[tone]].join(" ")}>
      {message}
    </p>
  );
}

function StatusBadge({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: AdminTone;
}) {
  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-xs",
        toneBorderClasses[tone],
        toneTextClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function StudioEditForm({
  title,
  description,
  teaser,
  unlockedNote,
  category,
  unlockMode,
  requiredPuzzleId,
  sortOrder,
  status,
  recentMagicPuzzles,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onTeaserChange,
  onUnlockedNoteChange,
  onCategoryChange,
  onUnlockModeChange,
  onRequiredPuzzleIdChange,
  onSortOrderChange,
  onStatusChange,
  onSave,
  onCancel,
}: {
  title: string;
  description: string;
  teaser: string;
  unlockedNote: string;
  category: StudioCategory;
  unlockMode: StudioUnlockMode;
  requiredPuzzleId: string;
  sortOrder: string;
  status: StudioItemStatus;
  recentMagicPuzzles: MagicPuzzleRow[];
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTeaserChange: (value: string) => void;
  onUnlockedNoteChange: (value: string) => void;
  onCategoryChange: (value: StudioCategory) => void;
  onUnlockModeChange: (value: StudioUnlockMode) => void;
  onRequiredPuzzleIdChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onStatusChange: (value: StudioItemStatus) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-2">
      <FormInput
        label="标题"
        value={title}
        onChange={onTitleChange}
        tone="amber"
      />

      <FormSelect<StudioCategory>
        label="分类"
        value={category}
        onChange={onCategoryChange}
        tone="amber"
      >
        <option value="sunlight">日光底片</option>
        <option value="heartbeat">心跳短片</option>
        <option value="rose">玫瑰暗格</option>
        <option value="bloopers">笨蛋花絮</option>
      </FormSelect>

      <FormSelect<StudioUnlockMode>
        label="解锁方式"
        value={unlockMode}
        onChange={(nextMode) => {
          onUnlockModeChange(nextMode);

          if (nextMode !== "magic_puzzle") {
            onRequiredPuzzleIdChange("");
          }
        }}
        tone="amber"
      >
        <option value="always">默认开放</option>
        <option value="magic_puzzle">Magic 谜题解锁</option>
        <option value="manual">手动解锁，后续扩展</option>
        <option value="password">密码解锁，后续扩展</option>
      </FormSelect>

      <FormSelect<StudioItemStatus>
        label="状态"
        value={status}
        onChange={onStatusChange}
        tone="amber"
      >
        <option value="active">开放</option>
        <option value="hidden">隐藏</option>
      </FormSelect>

      {unlockMode === "magic_puzzle" ? (
        <FormSelect<string>
          label="绑定 Magic 谜题"
          value={requiredPuzzleId}
          onChange={onRequiredPuzzleIdChange}
          tone="amber"
          spanFull
        >
          <option value="">选择一个谜题</option>
          {recentMagicPuzzles.map((puzzle) => (
            <option key={puzzle.id} value={puzzle.id}>
              {puzzle.title_cn} · {puzzle.slug}
            </option>
          ))}
        </FormSelect>
      ) : null}

      <FormInput
        label="排序值"
        type="number"
        value={sortOrder}
        onChange={onSortOrderChange}
        tone="amber"
      />

      <FormTextarea
        label="外层预告"
        value={teaser}
        onChange={onTeaserChange}
        tone="amber"
      />

      <FormTextarea
        label="内容描述"
        value={description}
        onChange={onDescriptionChange}
        minHeightClass="min-h-24"
        tone="amber"
      />

      <FormTextarea
        label="解锁后说明"
        value={unlockedNote}
        onChange={onUnlockedNoteChange}
        tone="amber"
      />

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <ActionButton
          onClick={onSave}
          disabled={isSaving}
          tone="amber"
        >
          {isSaving ? "保存中……" : "保存修改"}
        </ActionButton>

        <ActionButton
          onClick={onCancel}
          tone="stone"
        >
          取消
        </ActionButton>
      </div>
    </div>
  );
}

function StudioItemManageCard({
  item,
  isEditing,
  isSaving,
  isDeleting,
  recentMagicPuzzles,
  editState,
  onStartEdit,
  onSetStatus,
  onDelete,
  onSaveEdit,
  onCancelEdit,
}: {
  item: StudioItemRow;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  recentMagicPuzzles: MagicPuzzleRow[];
  editState: {
    title: string;
    description: string;
    teaser: string;
    unlockedNote: string;
    category: StudioCategory;
    unlockMode: StudioUnlockMode;
    requiredPuzzleId: string;
    sortOrder: string;
    status: StudioItemStatus;
    setTitle: (value: string) => void;
    setDescription: (value: string) => void;
    setTeaser: (value: string) => void;
    setUnlockedNote: (value: string) => void;
    setCategory: (value: StudioCategory) => void;
    setUnlockMode: (value: StudioUnlockMode) => void;
    setRequiredPuzzleId: (value: string) => void;
    setSortOrder: (value: string) => void;
    setStatus: (value: StudioItemStatus) => void;
  };
  onStartEdit: (item: StudioItemRow) => void;
  onSetStatus: (item: StudioItemRow, status: StudioItemStatus) => void;
  onDelete: (item: StudioItemRow) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-100">
            {item.title_cn}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {getStudioCategoryLabel(item.category)} · {item.media_type} ·{" "}
            {getStudioUnlockModeLabel(item.unlock_mode)}
            {item.required_puzzle_title_cn
              ? ` · ${item.required_puzzle_title_cn}`
              : ""}{" "}
            · 排序 {item.sort_order} · {formatDateTime(item.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={item.status === "active" ? "emerald" : "stone"}>
            {getStudioStatusLabel(item.status)}
          </StatusBadge>

          <StatusBadge tone="amber">
            {item.is_unlocked ? "已解锁" : "未解锁"}
          </StatusBadge>

          <ActionButton
            onClick={() => onStartEdit(item)}
            tone="stone"
            compact
          >
            编辑
          </ActionButton>

          <ActionButton
            onClick={() =>
              onSetStatus(
                item,
                item.status === "active" ? "hidden" : "active",
              )
            }
            disabled={isSaving}
            tone="violet"
            compact
          >
            {item.status === "active" ? "隐藏" : "恢复"}
          </ActionButton>

          <ActionButton
            onClick={() => onDelete(item)}
            disabled={isDeleting}
            tone="red"
            compact
          >
            {isDeleting ? "删除中……" : "删除"}
          </ActionButton>
        </div>
      </div>

      {isEditing ? (
        <StudioEditForm
          title={editState.title}
          description={editState.description}
          teaser={editState.teaser}
          unlockedNote={editState.unlockedNote}
          category={editState.category}
          unlockMode={editState.unlockMode}
          requiredPuzzleId={editState.requiredPuzzleId}
          sortOrder={editState.sortOrder}
          status={editState.status}
          recentMagicPuzzles={recentMagicPuzzles}
          isSaving={isSaving}
          onTitleChange={editState.setTitle}
          onDescriptionChange={editState.setDescription}
          onTeaserChange={editState.setTeaser}
          onUnlockedNoteChange={editState.setUnlockedNote}
          onCategoryChange={editState.setCategory}
          onUnlockModeChange={editState.setUnlockMode}
          onRequiredPuzzleIdChange={editState.setRequiredPuzzleId}
          onSortOrderChange={editState.setSortOrder}
          onStatusChange={editState.setStatus}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      ) : null}
    </div>
  );
}

function PendingGiftReviewCard({
  gift,
  selectedImageFile,
  isReviewing,
  onImageChange,
  onActivate,
}: {
  gift: PendingGift;
  selectedImageFile: File | null;
  isReviewing: boolean;
  onImageChange: (giftId: string, file: File | null) => void;
  onActivate: (giftId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{gift.title_cn}</p>
          <p className="mt-1 text-sm text-stone-400">
            {gift.price} 星光值 · {formatDateTime(gift.created_at)}
          </p>
        </div>

        <StatusBadge tone="amber">待审核</StatusBadge>
      </div>

      <div className="mt-4 space-y-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) =>
            onImageChange(gift.id, event.target.files?.[0] ?? null)
          }
          className="block w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-200 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
        />

        <p className="text-xs text-stone-500">
          {selectedImageFile ? selectedImageFile.name : "请选择审核上架图片。"}
        </p>

        <ActionButton
          onClick={() => onActivate(gift.id)}
          disabled={isReviewing}
          tone="amber"
        >
          {isReviewing ? "正在上架……" : "上传图片并上架"}
        </ActionButton>
      </div>
    </div>
  );
}

function RedemptionManageCard({
  redemption,
  arrivalValue,
  isSaving,
  onArrivalChange,
  onSaveArrival,
}: {
  redemption: RedemptionRow;
  arrivalValue: string;
  isSaving: boolean;
  onArrivalChange: (redemptionId: string, value: string) => void;
  onSaveArrival: (redemptionId: string) => void;
}) {
  const canEditArrival = redemption.status === "pending_receipt";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
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

          {canEditArrival ? (
            <div className="mt-4 grid gap-3">
              <input
                type="datetime-local"
                value={arrivalValue}
                onChange={(event) =>
                  onArrivalChange(redemption.id, event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-emerald-200/50"
              />

              <ActionButton
                onClick={() => onSaveArrival(redemption.id)}
                disabled={isSaving}
                tone="emerald"
              >
                {isSaving ? "正在保存……" : "保存预计到货时间"}
              </ActionButton>
            </div>
          ) : null}
        </div>

        <StatusBadge tone="emerald">
          {getRedemptionStatusLabel(redemption.status)}
        </StatusBadge>
      </div>
    </div>
  );
}

function MessageActivityCard({
  message,
  updatingMessageId = null,
  onToggleHidden,
  onDeleteMessage,
}: {
  message: MessageRow;
  updatingMessageId?: string | null;
  onToggleHidden?: (message: MessageRow) => void;
  onDeleteMessage?: (message: MessageRow) => void;
}) {
  const isUpdating = updatingMessageId === message.id;
  const canManage = Boolean(onToggleHidden || onDeleteMessage);

  return (
    <div
      className={[
        "rounded-2xl border p-4",
        message.is_hidden
          ? "border-amber-100/20 bg-amber-100/10"
          : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={[
            "line-clamp-3 text-sm",
            message.is_hidden ? "text-stone-400" : "text-stone-200",
          ].join(" ")}
        >
          {message.content}
        </p>

        {message.is_hidden ? (
          <span className="shrink-0 rounded-full border border-amber-100/20 bg-amber-100/10 px-2.5 py-1 text-xs text-amber-100">
            已隐藏
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-emerald-100/15 bg-emerald-100/10 px-2.5 py-1 text-xs text-emerald-100">
            显示中
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-stone-500">
        {message.author_display_name ?? "匿名"} ·{" "}
        {message.author_role ?? "unknown"} · {formatDateTime(message.created_at)}
      </p>

      {message.hidden_at ? (
        <p className="mt-1 text-xs text-amber-100/70">
          隐藏时间：{formatDateTime(message.hidden_at)}
        </p>
      ) : null}

      {canManage ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {onToggleHidden ? (
            <button
              type="button"
              onClick={() => onToggleHidden(message)}
              disabled={isUpdating}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "处理中……"
                : message.is_hidden
                  ? "恢复显示"
                  : "隐藏"}
            </button>
          ) : null}

          {onDeleteMessage ? (
            <button
              type="button"
              onClick={() => onDeleteMessage(message)}
              disabled={isUpdating}
              className="rounded-full border border-red-200/20 bg-red-400/10 px-3 py-1.5 text-xs text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              删除
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EnergyTransactionCard({
  transaction,
}: {
  transaction: EnergyTransactionRow;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {transaction.description ?? transaction.source}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {transaction.source} · {formatDateTime(transaction.created_at)}
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
  );
}

function OverviewDashboard({
  pendingGiftsCount,
  pendingReceiptCount,
  activeMagicCount,
  hiddenMagicCount,
  totalStudioCount,
  activeStudioCount,
  hiddenStudioCount,
  messages,
  recentEnergyNetAmount,
  energyTransactionCount,
  onSelectTab,
}: {
  pendingGiftsCount: number;
  pendingReceiptCount: number;
  activeMagicCount: number;
  hiddenMagicCount: number;
  totalStudioCount: number;
  activeStudioCount: number;
  hiddenStudioCount: number;
  messages: MessageRow[];
  recentEnergyNetAmount: number;
  energyTransactionCount: number;
  onSelectTab: (tab: AdminTab) => void;
}) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        <OverviewStatCard
          label="待审核礼物"
          value={pendingGiftsCount}
          onClick={() => onSelectTab("market")}
        />

        <OverviewStatCard
          label="待签收兑换"
          value={pendingReceiptCount}
          onClick={() => onSelectTab("market")}
        />

        <OverviewStatCard
          label="开放谜题"
          value={activeMagicCount}
          detail={`隐藏 ${hiddenMagicCount}`}
          onClick={() => onSelectTab("magic")}
        />

        <OverviewStatCard
          label="暗房内容"
          value={totalStudioCount}
          detail={`开放 ${activeStudioCount} · 隐藏 ${hiddenStudioCount}`}
          onClick={() => onSelectTab("studio")}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <h2 className="text-lg font-semibold">最近留言</h2>

          <div className="mt-4 space-y-3">
            {messages.slice(0, 3).map((message) => (
              <MessageActivityCard key={message.id} message={message} />
            ))}

            {messages.length === 0 ? (
              <p className="text-sm text-stone-500">暂无留言。</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <h2 className="text-lg font-semibold">最近星光值净变化</h2>

          <p
            className={[
              "mt-4 text-4xl font-semibold",
              recentEnergyNetAmount >= 0 ? "text-emerald-200" : "text-rose-200",
            ].join(" ")}
          >
            {getAmountLabel(recentEnergyNetAmount)}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            基于最近 {energyTransactionCount} 条流水。
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <h2 className="text-lg font-semibold">快捷入口</h2>

          <div className="mt-4 grid gap-2">
            <QuickAdminAction
              label="发布或审核礼物"
              onClick={() => onSelectTab("market")}
            />

            <QuickAdminAction
              label="创建魔法谜题"
              onClick={() => onSelectTab("magic")}
            />

            <QuickAdminAction
              label="管理记忆暗房"
              onClick={() => onSelectTab("studio")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
function OverviewStatCard({
  label,
  value,
  detail,
  onClick,
}: {
  label: string;
  value: number;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/10 p-5 text-left transition hover:bg-white/15"
    >
      <p className="text-sm text-stone-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>

      {detail ? (
        <p className="mt-1 text-xs text-stone-500">{detail}</p>
      ) : null}
    </button>
  );
}

function QuickAdminAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-stone-200 transition hover:bg-white/10"
    >
      {label}
    </button>
  );
}

function MagicCreateForm({
  slug,
  title,
  teaser,
  riddle,
  hint,
  unlockNote,
  answer,
  status,
  publishAt,
  rewardEnergy,
  surpriseTitle,
  surpriseNote,
  isCreating,
  statusMessage,
  onSlugChange,
  onTitleChange,
  onTeaserChange,
  onRiddleChange,
  onHintChange,
  onUnlockNoteChange,
  onAnswerChange,
  onStatusChange,
  onPublishAtChange,
  onRewardEnergyChange,
  onSurpriseTitleChange,
  onSurpriseNoteChange,
  onCreate,
}: {
  slug: string;
  title: string;
  teaser: string;
  riddle: string;
  hint: string;
  unlockNote: string;
  answer: string;
  status: MagicPuzzleStatus;
  publishAt: string;
  rewardEnergy: string;
  surpriseTitle: string;
  surpriseNote: string;
  isCreating: boolean;
  statusMessage: string;
  onSlugChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTeaserChange: (value: string) => void;
  onRiddleChange: (value: string) => void;
  onHintChange: (value: string) => void;
  onUnlockNoteChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onStatusChange: (value: MagicPuzzleStatus) => void;
  onPublishAtChange: (value: string) => void;
  onRewardEnergyChange: (value: string) => void;
  onSurpriseTitleChange: (value: string) => void;
  onSurpriseNoteChange: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormInput
          label="谜题标题"
          value={title}
          onChange={onTitleChange}
          placeholder="例如：月亮写下的线索"
          tone="violet"
        />

        <FormInput
          label="Slug，可选"
          value={slug}
          onChange={onSlugChange}
          placeholder="例如：moon-clue-001"
          tone="violet"
        />

        <FormInput
          label="上线时间"
          type="datetime-local"
          value={publishAt}
          onChange={onPublishAtChange}
          help="这里按你当前设备时区填写；保存后会转换成绝对时间。后台会同时显示多伦多时间和北京时间。"
          tone="violet"
        />

        <FormInput
          label="答对奖励星光值"
          type="number"
          min="0"
          value={rewardEnergy}
          onChange={onRewardEnergyChange}
          help="默认 3。答对后只奖励第一次。"
          tone="violet"
        />

        <FormSelect<MagicPuzzleStatus>
          label="状态"
          value={status}
          onChange={onStatusChange}
          tone="violet"
        >
          <option value="active">开放</option>
          <option value="hidden">隐藏</option>
        </FormSelect>

        <FormTextarea
          label="水晶球外层预告"
          value={teaser}
          onChange={onTeaserChange}
          placeholder="例如：这颗水晶球里藏着一段和晚安有关的秘密。"
          help="这段会显示在水晶球外层，不是谜题正文，也不是付费线索。"
          tone="violet"
        />

        <FormTextarea
          label="谜题正文"
          value={riddle}
          onChange={onRiddleChange}
          placeholder="写下线索、问题或谜面。"
          minHeightClass="min-h-28"
          tone="violet"
        />

        <FormTextarea
          label="提示，可选"
          value={hint}
          onChange={onHintChange}
          placeholder="答错时可以展示的提示。"
          tone="violet"
        />

        <FormTextarea
          label="解锁后文案，可选"
          value={unlockNote}
          onChange={onUnlockNoteChange}
          placeholder="答对后显示的话。"
          tone="violet"
        />

        <FormInput
          label="暗房惊喜标题，可选"
          value={surpriseTitle}
          onChange={onSurpriseTitleChange}
          placeholder="例如：记忆暗房已解锁"
          tone="violet"
          spanFull
        />

        <FormTextarea
          label="暗房惊喜提醒，可选"
          value={surpriseNote}
          onChange={onSurpriseNoteChange}
          placeholder="例如：日光底片里有一张新的照片醒来了，去记忆暗房看看。"
          tone="violet"
        />

        <FormInput
          label="正确答案"
          value={answer}
          onChange={onAnswerChange}
          placeholder="例如：520"
          help="答案会进入 magic_puzzle_answers，不会展示给女主人公。"
          tone="violet"
          spanFull
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ActionButton
          onClick={onCreate}
          disabled={isCreating}
          tone="violet"
        >
          {isCreating ? "正在创建……" : "创建魔法谜题"}
        </ActionButton>

        <StatusLine message={statusMessage} tone="violet" />
      </div>
    </>
  );
}

function MagicPuzzleList({ puzzles }: { puzzles: MagicPuzzleRow[] }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold text-stone-200">最近谜题</h3>

      {puzzles.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">暂无魔法谜题。</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {puzzles.map((puzzle) => (
            <MagicPuzzleListCard key={puzzle.id} puzzle={puzzle} />
          ))}
        </div>
      )}
    </div>
  );
}

function MagicPuzzleListCard({ puzzle }: { puzzle: MagicPuzzleRow }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-100">
            {puzzle.title_cn}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {puzzle.slug} · 奖励 +{puzzle.reward_energy} · 多伦多{" "}
            {formatTorontoTime(puzzle.publish_at)} · 北京{" "}
            {formatBeijingTime(puzzle.publish_at)}
          </p>
        </div>

        <StatusBadge tone="violet">
          {puzzle.status === "active" ? "开放" : "隐藏"}
        </StatusBadge>
      </div>
    </div>
  );
}

function StudioCreateForm({
  title,
  description,
  teaser,
  unlockedNote,
  category,
  unlockMode,
  requiredPuzzleId,
  sortOrder,
  imageFile,
  recentMagicPuzzles,
  isCreating,
  statusMessage,
  onTitleChange,
  onDescriptionChange,
  onTeaserChange,
  onUnlockedNoteChange,
  onCategoryChange,
  onUnlockModeChange,
  onRequiredPuzzleIdChange,
  onSortOrderChange,
  onImageFileChange,
  onCreate,
}: {
  title: string;
  description: string;
  teaser: string;
  unlockedNote: string;
  category: StudioCategory;
  unlockMode: StudioUnlockMode;
  requiredPuzzleId: string;
  sortOrder: string;
  imageFile: File | null;
  recentMagicPuzzles: MagicPuzzleRow[];
  isCreating: boolean;
  statusMessage: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTeaserChange: (value: string) => void;
  onUnlockedNoteChange: (value: string) => void;
  onCategoryChange: (value: StudioCategory) => void;
  onUnlockModeChange: (value: StudioUnlockMode) => void;
  onRequiredPuzzleIdChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onImageFileChange: (file: File | null) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormInput
          label="标题"
          value={title}
          onChange={onTitleChange}
          placeholder="例如：第一张日光底片"
          tone="amber"
        />

        <FormSelect<StudioCategory>
          label="分类"
          value={category}
          onChange={onCategoryChange}
          tone="amber"
        >
          <option value="sunlight">日光底片</option>
          <option value="heartbeat">心跳短片</option>
          <option value="rose">玫瑰暗格</option>
          <option value="bloopers">笨蛋花絮</option>
        </FormSelect>

        <FormSelect<StudioUnlockMode>
          label="解锁方式"
          value={unlockMode}
          onChange={(nextMode) => {
            onUnlockModeChange(nextMode);

            if (nextMode !== "magic_puzzle") {
              onRequiredPuzzleIdChange("");
            }
          }}
          tone="amber"
        >
          <option value="always">默认开放</option>
          <option value="magic_puzzle">Magic 谜题解锁</option>
          <option value="manual">手动解锁，后续扩展</option>
          <option value="password">密码解锁，后续扩展</option>
        </FormSelect>

        <FormInput
          label="排序值"
          type="number"
          value={sortOrder}
          onChange={onSortOrderChange}
          tone="amber"
        />

        {unlockMode === "magic_puzzle" ? (
          <FormSelect<string>
            label="绑定 Magic 谜题"
            value={requiredPuzzleId}
            onChange={onRequiredPuzzleIdChange}
            tone="amber"
            spanFull
          >
            <option value="">选择一个谜题</option>
            {recentMagicPuzzles.map((puzzle) => (
              <option key={puzzle.id} value={puzzle.id}>
                {puzzle.title_cn} · {puzzle.slug}
              </option>
            ))}
          </FormSelect>
        ) : null}

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-stone-300">素材文件</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={(event) => onImageFileChange(event.target.files?.[0] ?? null)}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
          />
          <span className="text-xs text-stone-500">
            {imageFile
              ? imageFile.name
              : "支持图片和短视频。建议视频先控制在较小体积。"}
          </span>
        </label>

        <FormTextarea
          label="外层预告"
          value={teaser}
          onChange={onTeaserChange}
          placeholder="例如：这枚底片还没有完全显影。"
          tone="amber"
        />

        <FormTextarea
          label="内容描述"
          value={description}
          onChange={onDescriptionChange}
          placeholder="图片或视频打开后显示的描述。"
          minHeightClass="min-h-24"
          tone="amber"
        />

        <FormTextarea
          label="解锁后说明"
          value={unlockedNote}
          onChange={onUnlockedNoteChange}
          placeholder="例如：这张底片是在某个谜题被点亮后显影的。"
          tone="amber"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ActionButton
          onClick={onCreate}
          disabled={isCreating}
          tone="amber"
        >
          {isCreating ? "正在创建……" : "创建暗房内容"}
        </ActionButton>

        <StatusLine message={statusMessage} tone="amber" />
      </div>
    </>
  );
}

function StudioManagePanel({
  items,
  filteredItems,
  categoryFilter,
  statusFilter,
  manageStatus,
  recentMagicPuzzles,
  editingItemId,
  savingItemId,
  deletingItemId,
  editState,
  onCategoryFilterChange,
  onStatusFilterChange,
  onStartEdit,
  onSetStatus,
  onDelete,
  onSaveEdit,
  onCancelEdit,
}: {
  items: StudioItemRow[];
  filteredItems: StudioItemRow[];
  categoryFilter: StudioCategoryFilter;
  statusFilter: StudioStatusFilter;
  manageStatus: string;
  recentMagicPuzzles: MagicPuzzleRow[];
  editingItemId: string | null;
  savingItemId: string | null;
  deletingItemId: string | null;
  editState: {
    title: string;
    description: string;
    teaser: string;
    unlockedNote: string;
    category: StudioCategory;
    unlockMode: StudioUnlockMode;
    requiredPuzzleId: string;
    sortOrder: string;
    status: StudioItemStatus;
    setTitle: (value: string) => void;
    setDescription: (value: string) => void;
    setTeaser: (value: string) => void;
    setUnlockedNote: (value: string) => void;
    setCategory: (value: StudioCategory) => void;
    setUnlockMode: (value: StudioUnlockMode) => void;
    setRequiredPuzzleId: (value: string) => void;
    setSortOrder: (value: string) => void;
    setStatus: (value: StudioItemStatus) => void;
  };
  onCategoryFilterChange: (value: StudioCategoryFilter) => void;
  onStatusFilterChange: (value: StudioStatusFilter) => void;
  onStartEdit: (item: StudioItemRow) => void;
  onSetStatus: (item: StudioItemRow, status: StudioItemStatus) => void;
  onDelete: (item: StudioItemRow) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold text-stone-200">最近暗房内容</h3>

      <StatusLine message={manageStatus} tone="amber" />

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <FormSelect<StudioCategoryFilter>
          label="分类筛选"
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          tone="amber"
        >
          <option value="all">全部分类</option>
          <option value="sunlight">日光底片</option>
          <option value="heartbeat">心跳短片</option>
          <option value="rose">玫瑰暗格</option>
          <option value="bloopers">笨蛋花絮</option>
        </FormSelect>

        <FormSelect<StudioStatusFilter>
          label="状态筛选"
          value={statusFilter}
          onChange={onStatusFilterChange}
          tone="amber"
        >
          <option value="all">全部状态</option>
          <option value="active">开放中</option>
          <option value="hidden">已隐藏</option>
        </FormSelect>

        <p className="text-xs text-stone-500">
          显示 {filteredItems.length} / {items.length}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">暂无暗房内容。</p>
      ) : filteredItems.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">当前筛选下没有暗房内容。</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {filteredItems.map((item) => (
            <StudioItemManageCard
              key={item.id}
              item={item}
              isEditing={editingItemId === item.id}
              isSaving={savingItemId === item.id}
              isDeleting={deletingItemId === item.id}
              recentMagicPuzzles={recentMagicPuzzles}
              editState={editState}
              onStartEdit={onStartEdit}
              onSetStatus={onSetStatus}
              onDelete={onDelete}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketPublishForm({
  title,
  description,
  price,
  icon,
  giftType,
  imageFile,
  isPublishing,
  statusMessage,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onIconChange,
  onGiftTypeChange,
  onImageFileChange,
  onPublish,
}: {
  title: string;
  description: string;
  price: string;
  icon: string;
  giftType: GiftType;
  imageFile: File | null;
  isPublishing: boolean;
  statusMessage: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onGiftTypeChange: (value: GiftType) => void;
  onImageFileChange: (file: File | null) => void;
  onPublish: () => void;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormInput
          label="礼物标题"
          value={title}
          onChange={onTitleChange}
          placeholder="例如：一杯热奶茶"
          tone="amber"
        />

        <FormInput
          label="星光值价格"
          type="number"
          min="1"
          value={price}
          onChange={onPriceChange}
          tone="amber"
        />

        <FormInput
          label="礼物图标"
          value={icon}
          onChange={onIconChange}
          placeholder="◆"
          tone="amber"
        />

        <FormSelect<GiftType>
          label="礼物类型"
          value={giftType}
          onChange={onGiftTypeChange}
          tone="amber"
        >
          <option value="virtual">虚拟礼物</option>
          <option value="physical">实体礼物</option>
          <option value="date_plan">约会计划</option>
        </FormSelect>

        <FormTextarea
          label="礼物描述"
          value={description}
          onChange={onDescriptionChange}
          placeholder="写下这个礼物的说明。"
          minHeightClass="min-h-28"
          tone="amber"
        />

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-stone-300">礼物图片</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) =>
              onImageFileChange(event.target.files?.[0] ?? null)
            }
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
          />
          <span className="text-xs text-stone-500">
            {imageFile
              ? imageFile.name
              : "可选。上传后会显示在礼物卡片中。"}
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ActionButton
          onClick={onPublish}
          disabled={isPublishing}
          tone="amber"
        >
          {isPublishing ? "正在发布……" : "直接发布礼物"}
        </ActionButton>

        <StatusLine message={statusMessage} tone="amber" />
      </div>
    </>
  );
}

function MarketManagePanel({
  pendingGifts,
  redemptions,
  reviewStatus,
  arrivalStatus,
  reviewImageFiles,
  reviewingGiftId,
  savingArrivalId,
  arrivalInputs,
  onReviewImageChange,
  onActivateGift,
  onArrivalChange,
  onSaveArrival,
}: {
  pendingGifts: PendingGift[];
  redemptions: RedemptionRow[];
  reviewStatus: string;
  arrivalStatus: string;
  reviewImageFiles: Record<string, File | null>;
  reviewingGiftId: string | null;
  savingArrivalId: string | null;
  arrivalInputs: Record<string, string>;
  onReviewImageChange: (giftId: string, file: File | null) => void;
  onActivateGift: (giftId: string) => void;
  onArrivalChange: (redemptionId: string, value: string) => void;
  onSaveArrival: (redemptionId: string) => void;
}) {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
        <h2 className="text-xl font-semibold">待审核礼物需求</h2>

        {reviewStatus ? (
          <p className="mt-3 rounded-2xl border border-amber-200/20 bg-amber-100/10 px-4 py-3 text-sm text-amber-100">
            {reviewStatus}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {pendingGifts.length === 0 ? (
            <p className="text-sm text-stone-400">暂无待审核礼物。</p>
          ) : (
            pendingGifts.map((gift) => (
              <PendingGiftReviewCard
                key={gift.id}
                gift={gift}
                selectedImageFile={reviewImageFiles[gift.id] ?? null}
                isReviewing={reviewingGiftId === gift.id}
                onImageChange={onReviewImageChange}
                onActivate={onActivateGift}
              />
            ))
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
        <h2 className="text-xl font-semibold">近期兑换记录</h2>

        {arrivalStatus ? (
          <p className="mt-3 rounded-2xl border border-emerald-200/20 bg-emerald-100/10 px-4 py-3 text-sm text-emerald-100">
            {arrivalStatus}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {redemptions.length === 0 ? (
            <p className="text-sm text-stone-400">暂无兑换记录。</p>
          ) : (
            redemptions.map((redemption) => (
              <RedemptionManageCard
                key={redemption.id}
                redemption={redemption}
                arrivalValue={arrivalInputs[redemption.id] ?? ""}
                isSaving={savingArrivalId === redemption.id}
                onArrivalChange={onArrivalChange}
                onSaveArrival={onSaveArrival}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ActivityPanel({
  messages,
  energyTransactions,
  treeMessageWriteMode,
  treeMessageSettingStatus,
  isSavingTreeMessageSetting,
  messageManageStatus,
  updatingMessageId,
  onTreeMessageWriteModeChange,
  onToggleMessageHidden,
  onDeleteMessage,
}: {
  messages: MessageRow[];
  energyTransactions: EnergyTransactionRow[];
  treeMessageWriteMode: TreeWriteMode;
  treeMessageSettingStatus: string;
  isSavingTreeMessageSetting: boolean;
  messageManageStatus: string;
  updatingMessageId: string | null;
  onTreeMessageWriteModeChange: (nextMode: TreeWriteMode) => void;
  onToggleMessageHidden: (message: MessageRow) => void;
  onDeleteMessage: (message: MessageRow) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-emerald-100/15 bg-emerald-100/10 p-6 lg:col-span-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/70">
                Tree Permission
            </p>
            <h2 className="mt-2 text-xl font-semibold">留言权限配置</h2>
            <p className="mt-2 text-sm leading-6 text-stone-300">
                控制前台留言树当前允许谁新增留言。公开浏览不受影响。
            </p>
            </div>

            <div className="rounded-full border border-emerald-100/20 bg-black/20 px-4 py-2 text-xs text-emerald-100">
            当前：{
                treeWriteModeOptions.find(
                (option) => option.value === treeMessageWriteMode,
                )?.label ?? treeMessageWriteMode
            }
            </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {treeWriteModeOptions.map((option) => {
            const isActive = option.value === treeMessageWriteMode;

            return (
                <button
                key={option.value}
                type="button"
                onClick={() => onTreeMessageWriteModeChange(option.value)}
                disabled={isSavingTreeMessageSetting || isActive}
                className={[
                    "rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70",
                    isActive
                    ? "border-emerald-100/50 bg-emerald-100/20 text-emerald-50"
                    : "border-white/10 bg-black/20 text-stone-300 hover:border-emerald-100/30 hover:bg-emerald-100/10",
                ].join(" ")}
                >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-2 text-xs leading-5 text-stone-400">
                    {option.description}
                </p>
                </button>
            );
            })}
        </div>

        {treeMessageSettingStatus ? (
            <p className="mt-4 text-sm text-emerald-100/80">
            {treeMessageSettingStatus}
            </p>
        ) : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">最近留言</h2>

            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-stone-400">
                显示最近 {messages.length} 条
            </span>
        </div>

        {messageManageStatus ? (
            <p className="mt-3 rounded-2xl border border-emerald-100/15 bg-emerald-100/10 px-4 py-3 text-sm text-emerald-100">
                {messageManageStatus}
            </p>
        ) : null}

        <div className="mt-5 space-y-3">
            {messages.length === 0 ? (
                <p className="text-sm text-stone-400">暂无留言。</p>
            ) : (
                messages.map((message) => (
                    <MessageActivityCard
                        key={message.id}
                        message={message}
                        updatingMessageId={updatingMessageId}
                        onToggleHidden={onToggleMessageHidden}
                        onDeleteMessage={onDeleteMessage}
                    />
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
              <EnergyTransactionCard
                key={transaction.id}
                transaction={transaction}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}