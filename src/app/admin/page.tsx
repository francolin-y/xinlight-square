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

type GiftType = "virtual" | "physical" | "date_plan";
type StudioMediaType = "image" | "video";
type StudioCategory = "sunlight" | "heartbeat" | "rose" | "bloopers";
type StudioUnlockMode = "always" | "magic_puzzle" | "manual" | "password";
type StudioItemStatus = "active" | "hidden";

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

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  const [accessStatus, setAccessStatus] = useState<AccessStatus>("loading");
  const [displayName, setDisplayName] = useState("站长");
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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

    setRecentStudioItems(((data ?? []) as StudioItemRow[]).slice(0, 8));
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

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
                Publish Gift
                </p>
                <h2 className="text-xl font-semibold">直接发布礼物</h2>
                <p className="text-sm text-stone-400">
                这里由站长直接创建 active 礼物，发布后会进入 Market 货架。
                </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                <span className="text-sm text-stone-300">礼物标题</span>
                <input
                    value={newGiftTitle}
                    onChange={(event) => setNewGiftTitle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="例如：一杯热奶茶"
                />
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">星光值价格</span>
                <input
                    type="number"
                    min="1"
                    value={newGiftPrice}
                    onChange={(event) => setNewGiftPrice(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                />
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">礼物图标</span>
                <input
                    value={newGiftIcon}
                    onChange={(event) => setNewGiftIcon(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="◆"
                />
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">礼物类型</span>
                <select
                    value={newGiftType}
                    onChange={(event) => setNewGiftType(event.target.value as GiftType)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                >
                    <option value="virtual">虚拟礼物</option>
                    <option value="physical">实体礼物</option>
                    <option value="date_plan">约会计划</option>
                </select>
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">礼物描述</span>
                <textarea
                    value={newGiftDescription}
                    onChange={(event) => setNewGiftDescription(event.target.value)}
                    className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="写下这个礼物的说明。"
                />
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">礼物图片</span>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    onChange={(event) =>
                    setNewGiftImageFile(event.target.files?.[0] ?? null)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
                />
                <span className="text-xs text-stone-500">
                    {newGiftImageFile ? newGiftImageFile.name : "可选。上传后会显示在礼物卡片中。"}
                </span>
                </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                type="button"
                onClick={() => void handlePublishGift()}
                disabled={isPublishingGift}
                className="rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {isPublishingGift ? "正在发布……" : "直接发布礼物"}
                </button>

                {publishGiftStatus ? (
                <p className="text-sm text-amber-100">{publishGiftStatus}</p>
                ) : null}
            </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200/80">
                Magic Puzzle
                </p>
                <h2 className="text-xl font-semibold">创建魔法谜题</h2>
                <p className="text-sm text-stone-400">
                谜题会按上线时间出现在魔法空间。未到时间时，水晶球会保持沉睡。
                </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                <span className="text-sm text-stone-300">谜题标题</span>
                <input
                    value={magicTitle}
                    onChange={(event) => setMagicTitle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    placeholder="例如：月亮写下的线索"
                />
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">Slug，可选</span>
                <input
                    value={magicSlug}
                    onChange={(event) => setMagicSlug(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    placeholder="例如：moon-clue-001"
                />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm text-stone-300">上线时间</span>
                    <input
                        type="datetime-local"
                        value={magicPublishAt}
                        onChange={(event) => setMagicPublishAt(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    />
                    <span className="text-xs text-stone-500">
                        这里按你当前设备时区填写；保存后会转换成绝对时间。后台会同时显示多伦多时间和北京时间。
                    </span>
                </label>

                <label className="grid gap-2">
                    <span className="text-sm text-stone-300">答对奖励星光值</span>
                    <input
                        type="number"
                        min="0"
                        value={magicRewardEnergy}
                        onChange={(event) => setMagicRewardEnergy(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    />
                    <span className="text-xs text-stone-500">
                        默认 3。答对后只奖励第一次。
                    </span>
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">状态</span>
                <select
                    value={magicStatus}
                    onChange={(event) =>
                    setMagicStatus(event.target.value as MagicPuzzleStatus)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                >
                    <option value="active">开放</option>
                    <option value="hidden">隐藏</option>
                </select>
                </label>

                <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-stone-300">水晶球外层预告</span>
                    <textarea
                        value={magicTeaser}
                        onChange={(event) => setMagicTeaser(event.target.value)}
                        className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                        placeholder="例如：这颗水晶球里藏着一段和晚安有关的秘密。"
                    />
                    <span className="text-xs text-stone-500">
                        这段会显示在水晶球外层，不是谜题正文，也不是付费线索。
                    </span>
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">谜题正文</span>
                <textarea
                    value={magicRiddle}
                    onChange={(event) => setMagicRiddle(event.target.value)}
                    className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    placeholder="写下线索、问题或谜面。"
                />
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">提示，可选</span>
                <textarea
                    value={magicHint}
                    onChange={(event) => setMagicHint(event.target.value)}
                    className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    placeholder="答错时可以展示的提示。"
                />
                </label>

                <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-stone-300">解锁后文案，可选</span>
                    <textarea
                        value={magicUnlockNote}
                        onChange={(event) => setMagicUnlockNote(event.target.value)}
                        className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                        placeholder="答对后显示的话。"
                    />
                </label>

                <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-stone-300">暗房惊喜标题，可选</span>
                    <input
                        value={magicSurpriseTitle}
                        onChange={(event) => setMagicSurpriseTitle(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                        placeholder="例如：记忆暗房已解锁"
                    />
                    </label>

                    <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-stone-300">暗房惊喜提醒，可选</span>
                    <textarea
                        value={magicSurpriseNote}
                        onChange={(event) => setMagicSurpriseNote(event.target.value)}
                        className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                        placeholder="例如：日光底片里有一张新的照片醒来了，去记忆暗房看看。"
                    />
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">正确答案</span>
                <input
                    value={magicAnswer}
                    onChange={(event) => setMagicAnswer(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-violet-200/50"
                    placeholder="例如：520"
                />
                <span className="text-xs text-stone-500">
                    答案会进入 magic_puzzle_answers，不会展示给女主人公。
                </span>
                </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                type="button"
                onClick={() => void handleCreateMagicPuzzle()}
                disabled={isCreatingMagicPuzzle}
                className="rounded-full border border-violet-200/40 bg-violet-100/10 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {isCreatingMagicPuzzle ? "正在创建……" : "创建魔法谜题"}
                </button>

                {magicPuzzleStatus ? (
                <p className="text-sm text-violet-100">{magicPuzzleStatus}</p>
                ) : null}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-stone-200">最近谜题</h3>

                {recentMagicPuzzles.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">暂无魔法谜题。</p>
                ) : (
                <div className="mt-3 grid gap-3">
                    {recentMagicPuzzles.map((puzzle) => (
                    <div
                        key={puzzle.id}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
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

                        <span className="rounded-full border border-violet-200/20 px-3 py-1 text-xs text-violet-100">
                            {puzzle.status === "active" ? "开放" : "隐藏"}
                        </span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
                Studio Item
                </p>
                <h2 className="text-xl font-semibold">创建记忆暗房内容</h2>
                <p className="text-sm text-stone-400">
                上传图片，并设置它是默认开放，还是由某个 Magic 谜题解锁。
                </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                <span className="text-sm text-stone-300">标题</span>
                <input
                    value={studioTitle}
                    onChange={(event) => setStudioTitle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="例如：第一张日光底片"
                />
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">分类</span>
                <select
                    value={studioCategory}
                    onChange={(event) =>
                    setStudioCategory(event.target.value as StudioCategory)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                >
                    <option value="sunlight">日光底片</option>
                    <option value="heartbeat">心跳短片</option>
                    <option value="rose">玫瑰暗格</option>
                    <option value="bloopers">笨蛋花絮</option>
                </select>
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">解锁方式</span>
                <select
                    value={studioUnlockMode}
                    onChange={(event) => {
                    const nextMode = event.target.value as StudioUnlockMode;
                    setStudioUnlockMode(nextMode);

                    if (nextMode !== "magic_puzzle") {
                        setStudioRequiredPuzzleId("");
                    }
                    }}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                >
                    <option value="always">默认开放</option>
                    <option value="magic_puzzle">Magic 谜题解锁</option>
                    <option value="manual">手动解锁，后续扩展</option>
                    <option value="password">密码解锁，后续扩展</option>
                </select>
                </label>

                <label className="grid gap-2">
                <span className="text-sm text-stone-300">排序值</span>
                <input
                    type="number"
                    value={studioSortOrder}
                    onChange={(event) => setStudioSortOrder(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                />
                </label>

                {studioUnlockMode === "magic_puzzle" ? (
                <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-stone-300">绑定 Magic 谜题</span>
                    <select
                    value={studioRequiredPuzzleId}
                    onChange={(event) => setStudioRequiredPuzzleId(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    >
                    <option value="">选择一个谜题</option>
                    {recentMagicPuzzles.map((puzzle) => (
                        <option key={puzzle.id} value={puzzle.id}>
                        {puzzle.title_cn} · {puzzle.slug}
                        </option>
                    ))}
                    </select>
                </label>
                ) : null}

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">图片文件</span>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) =>
                    setStudioImageFile(event.target.files?.[0] ?? null)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
                />
                <span className="text-xs text-stone-500">
                    {studioImageFile
                    ? studioImageFile.name
                    : "支持图片和短视频。建议视频先控制在较小体积。"}
                </span>
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">外层预告</span>
                <textarea
                    value={studioTeaser}
                    onChange={(event) => setStudioTeaser(event.target.value)}
                    className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="例如：这枚底片还没有完全显影。"
                />
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">内容描述</span>
                <textarea
                    value={studioDescription}
                    onChange={(event) => setStudioDescription(event.target.value)}
                    className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="图片打开后显示的描述。"
                />
                </label>

                <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-stone-300">解锁后说明</span>
                <textarea
                    value={studioUnlockedNote}
                    onChange={(event) => setStudioUnlockedNote(event.target.value)}
                    className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                    placeholder="例如：这张底片是在某个谜题被点亮后显影的。"
                />
                </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                type="button"
                onClick={() => void handleCreateStudioItem()}
                disabled={isCreatingStudioItem}
                className="rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {isCreatingStudioItem ? "正在创建……" : "创建暗房内容"}
                </button>

                {studioItemStatus ? (
                <p className="text-sm text-amber-100">{studioItemStatus}</p>
                ) : null}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-stone-200">最近暗房内容</h3>
                {studioManageStatus ? (
                    <p className="mt-3 text-sm text-amber-100">{studioManageStatus}</p>
                ) : null}
                {recentStudioItems.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">暂无暗房内容。</p>
                ) : (
                <div className="mt-3 grid gap-3">
                    {recentStudioItems.map((item) => {
                        const isEditing = editingStudioItemId === item.id;
                        const isSaving = savingStudioItemId === item.id;
                        const isDeleting = deletingStudioItemId === item.id;

                        return (
                            <div
                            key={item.id}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                            >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                <p className="text-sm font-semibold text-stone-100">
                                    {item.title_cn}
                                </p>
                                <p className="mt-1 text-xs text-stone-500">
                                    {item.category} · {item.media_type} · {item.unlock_mode}
                                    {item.required_puzzle_title_cn
                                    ? ` · ${item.required_puzzle_title_cn}`
                                    : ""}{" "}
                                    · 排序 {item.sort_order} · {formatDateTime(item.created_at)}
                                </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={[
                                    "rounded-full border px-3 py-1 text-xs",
                                    item.status === "active"
                                        ? "border-emerald-200/20 text-emerald-100"
                                        : "border-stone-400/20 text-stone-400",
                                    ].join(" ")}
                                >
                                    {item.status === "active" ? "开放中" : "已隐藏"}
                                </span>

                                <span className="rounded-full border border-amber-200/20 px-3 py-1 text-xs text-amber-100">
                                    {item.is_unlocked ? "已解锁" : "未解锁"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => startEditStudioItem(item)}
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-100 transition hover:bg-white/15"
                                >
                                    编辑
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                    void handleSetStudioItemStatus(
                                        item,
                                        item.status === "active" ? "hidden" : "active",
                                    )
                                    }
                                    disabled={isSaving}
                                    className="rounded-full border border-violet-200/20 bg-violet-100/10 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {item.status === "active" ? "隐藏" : "恢复"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void handleDeleteStudioItem(item)}
                                    disabled={isDeleting}
                                    className="rounded-full border border-red-200/20 bg-red-100/10 px-3 py-1 text-xs text-red-100 transition hover:bg-red-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? "删除中……" : "删除"}
                                </button>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-2">
                                <label className="grid gap-2">
                                    <span className="text-sm text-stone-300">标题</span>
                                    <input
                                    value={editStudioTitle}
                                    onChange={(event) => setEditStudioTitle(event.target.value)}
                                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-sm text-stone-300">分类</span>
                                    <select
                                    value={editStudioCategory}
                                    onChange={(event) =>
                                        setEditStudioCategory(event.target.value as StudioCategory)
                                    }
                                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    >
                                    <option value="sunlight">日光底片</option>
                                    <option value="heartbeat">心跳短片</option>
                                    <option value="rose">玫瑰暗格</option>
                                    <option value="bloopers">笨蛋花絮</option>
                                    </select>
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-sm text-stone-300">解锁方式</span>
                                    <select
                                    value={editStudioUnlockMode}
                                    onChange={(event) => {
                                        const nextMode = event.target.value as StudioUnlockMode;
                                        setEditStudioUnlockMode(nextMode);

                                        if (nextMode !== "magic_puzzle") {
                                        setEditStudioRequiredPuzzleId("");
                                        }
                                    }}
                                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    >
                                    <option value="always">默认开放</option>
                                    <option value="magic_puzzle">Magic 谜题解锁</option>
                                    <option value="manual">手动解锁，后续扩展</option>
                                    <option value="password">密码解锁，后续扩展</option>
                                    </select>
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-sm text-stone-300">状态</span>
                                    <select
                                    value={editStudioStatus}
                                    onChange={(event) =>
                                        setEditStudioStatus(event.target.value as StudioItemStatus)
                                    }
                                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    >
                                    <option value="active">开放</option>
                                    <option value="hidden">隐藏</option>
                                    </select>
                                </label>

                                {editStudioUnlockMode === "magic_puzzle" ? (
                                    <label className="grid gap-2 md:col-span-2">
                                    <span className="text-sm text-stone-300">绑定 Magic 谜题</span>
                                    <select
                                        value={editStudioRequiredPuzzleId}
                                        onChange={(event) =>
                                        setEditStudioRequiredPuzzleId(event.target.value)
                                        }
                                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    >
                                        <option value="">选择一个谜题</option>
                                        {recentMagicPuzzles.map((puzzle) => (
                                        <option key={puzzle.id} value={puzzle.id}>
                                            {puzzle.title_cn} · {puzzle.slug}
                                        </option>
                                        ))}
                                    </select>
                                    </label>
                                ) : null}

                                <label className="grid gap-2">
                                    <span className="text-sm text-stone-300">排序值</span>
                                    <input
                                    type="number"
                                    value={editStudioSortOrder}
                                    onChange={(event) => setEditStudioSortOrder(event.target.value)}
                                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    />
                                </label>

                                <label className="grid gap-2 md:col-span-2">
                                    <span className="text-sm text-stone-300">外层预告</span>
                                    <textarea
                                    value={editStudioTeaser}
                                    onChange={(event) => setEditStudioTeaser(event.target.value)}
                                    className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    />
                                </label>

                                <label className="grid gap-2 md:col-span-2">
                                    <span className="text-sm text-stone-300">内容描述</span>
                                    <textarea
                                    value={editStudioDescription}
                                    onChange={(event) =>
                                        setEditStudioDescription(event.target.value)
                                    }
                                    className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    />
                                </label>

                                <label className="grid gap-2 md:col-span-2">
                                    <span className="text-sm text-stone-300">解锁后说明</span>
                                    <textarea
                                    value={editStudioUnlockedNote}
                                    onChange={(event) =>
                                        setEditStudioUnlockedNote(event.target.value)
                                    }
                                    className="min-h-20 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50"
                                    />
                                </label>

                                <div className="flex flex-wrap gap-3 md:col-span-2">
                                    <button
                                    type="button"
                                    onClick={() => void handleUpdateStudioItem()}
                                    disabled={isSaving}
                                    className="rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                    {isSaving ? "保存中……" : "保存修改"}
                                    </button>

                                    <button
                                    type="button"
                                    onClick={cancelEditStudioItem}
                                    className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm text-stone-100 transition hover:bg-white/15"
                                    >
                                    取消
                                    </button>
                                </div>
                                </div>
                            ) : null}
                            </div>
                        );
                    })}
                </div>
                )}
            </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
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

                        <div className="mt-4 space-y-3">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            setReviewImageFiles((current) => ({
                                ...current,
                                [gift.id]: file,
                            }));
                            }}
                            className="block w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-200 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
                        />

                        <button
                            type="button"
                            onClick={() => void handleActivateGift(gift.id)}
                            disabled={reviewingGiftId === gift.id}
                            className="w-full rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {reviewingGiftId === gift.id ? "正在上架……" : "上传图片并上架"}
                        </button>
                        </div>
                    </div>
                    ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
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

                        {redemption.status === "pending_receipt" ? (
                          <div className="mt-4 grid gap-3">
                            <input
                              type="datetime-local"
                              value={arrivalInputs[redemption.id] ?? ""}
                              onChange={(event) =>
                                setArrivalInputs((current) => ({
                                  ...current,
                                  [redemption.id]: event.target.value,
                                }))
                              }
                              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-100 outline-none focus:border-emerald-200/50"
                            />

                            <button
                              type="button"
                              onClick={() => void handleSaveArrival(redemption.id)}
                              disabled={savingArrivalId === redemption.id}
                              className="rounded-full border border-emerald-200/40 bg-emerald-100/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-100/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingArrivalId === redemption.id
                                ? "正在保存……"
                                : "保存预计到货时间"}
                            </button>
                          </div>
                        ) : null}
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