export type StudioCategory =
  | "sunlight"
  | "heartbeat"
  | "rose"
  | "bloopers"
  | "audio";

export type StudioPanel = StudioCategory | "development";

export type StudioItemType = "photo" | "video" | "audio";

export type StudioItemStatus = "unlocked" | "locked";

export type StudioItem = {
  id: string;
  category: StudioCategory;
  type: StudioItemType;
  status: StudioItemStatus;
  date: string;
  title: {
    cn: string;
    en: string;
  };
  description: {
    cn: string;
    en: string;
  };

  // 后续接 Supabase Storage 时再启用
  thumbnailUrl?: string;
  mediaUrl?: string;

  // 后续可以对应魔法空间谜题 id
  puzzleId?: string;

  // 访客玩法可用
  isGuestVisible?: boolean;

  // 排序用
  order?: number;
};

export const ROSE_PASSWORD = "0419";

export const studioItems: StudioItem[] = [
  {
    id: "SUN-01",
    category: "sunlight",
    type: "photo",
    status: "unlocked",
    date: "2025.04.19",
    title: {
      cn: "日光底片 01",
      en: "Sunlight Negative 01",
    },
    description: {
      cn: "已经显影的公开照片，会挂在日光底片区。",
      en: "A developed public photo stored in the sunlight negatives.",
    },
    puzzleId: "magic-001",
    isGuestVisible: true,
    order: 1,
  },
  {
    id: "SUN-02",
    category: "sunlight",
    type: "photo",
    status: "unlocked",
    date: "2025.05.01",
    title: {
      cn: "日光底片 02",
      en: "Sunlight Negative 02",
    },
    description: {
      cn: "适合未来开放给访客浏览的照片。",
      en: "A photo that can later be opened to guests.",
    },
    puzzleId: "magic-002",
    isGuestVisible: true,
    order: 2,
  },
  {
    id: "SUN-03",
    category: "sunlight",
    type: "photo",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "封存底片",
      en: "Sealed Negative",
    },
    description: {
      cn: "还没有在魔法空间中解锁。",
      en: "Not yet unlocked in the magic space.",
    },
    puzzleId: "magic-003",
    isGuestVisible: false,
    order: 3,
  },
  {
    id: "SUN-04",
    category: "sunlight",
    type: "photo",
    status: "unlocked",
    date: "2025.06.12",
    title: {
      cn: "日光底片 04",
      en: "Sunlight Negative 04",
    },
    description: {
      cn: "可以被安全摆到日光下的记忆切片。",
      en: "A memory slice safe enough to be placed in daylight.",
    },
    puzzleId: "magic-004",
    isGuestVisible: true,
    order: 4,
  },
  {
    id: "SUN-05",
    category: "sunlight",
    type: "photo",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "未显影底片",
      en: "Undeveloped Negative",
    },
    description: {
      cn: "等待玩家继续解谜。",
      en: "Waiting for the player to solve more puzzles.",
    },
    puzzleId: "magic-005",
    isGuestVisible: false,
    order: 5,
  },
  {
    id: "VID-01",
    category: "heartbeat",
    type: "video",
    status: "unlocked",
    date: "2025.05.20",
    title: {
      cn: "心跳短片 01",
      en: "Heartbeat Clip 01",
    },
    description: {
      cn: "点击相机后可以查看的短片占位。",
      en: "A clip placeholder available through the camera.",
    },
    puzzleId: "magic-006",
    isGuestVisible: false,
    order: 6,
  },
  {
    id: "VID-02",
    category: "heartbeat",
    type: "video",
    status: "unlocked",
    date: "2025.06.01",
    title: {
      cn: "心跳短片 02",
      en: "Heartbeat Clip 02",
    },
    description: {
      cn: "未来会替换成真实视频。",
      en: "This will later be replaced with a real video.",
    },
    puzzleId: "magic-007",
    isGuestVisible: false,
    order: 7,
  },
  {
    id: "VID-03",
    category: "heartbeat",
    type: "video",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "未解锁短片",
      en: "Locked Clip",
    },
    description: {
      cn: "短片还封存在魔法空间。",
      en: "This clip is still sealed in the magic space.",
    },
    puzzleId: "magic-008",
    isGuestVisible: false,
    order: 8,
  },
  {
    id: "ROSE-01",
    category: "rose",
    type: "photo",
    status: "unlocked",
    date: "2025.04.19",
    title: {
      cn: "玫瑰暗格 01",
      en: "Rose Compartment 01",
    },
    description: {
      cn: "需要输入暗格密码后才能查看。",
      en: "Requires the rose compartment password.",
    },
    puzzleId: "magic-009",
    isGuestVisible: false,
    order: 9,
  },
  {
    id: "ROSE-02",
    category: "rose",
    type: "photo",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "封存暗格",
      en: "Sealed Compartment",
    },
    description: {
      cn: "即使打开暗格，也要等魔法空间解锁后才会显影。",
      en: "Even after opening the compartment, this remains sealed until unlocked.",
    },
    puzzleId: "magic-010",
    isGuestVisible: false,
    order: 10,
  },
  {
    id: "ROSE-03",
    category: "rose",
    type: "photo",
    status: "unlocked",
    date: "2025.07.07",
    title: {
      cn: "玫瑰暗格 03",
      en: "Rose Compartment 03",
    },
    description: {
      cn: "更靠近一点的照片，会收在这里。",
      en: "Closer, more private photos are stored here.",
    },
    puzzleId: "magic-011",
    isGuestVisible: false,
    order: 11,
  },
  {
    id: "FUN-01",
    category: "bloopers",
    type: "photo",
    status: "unlocked",
    date: "2025.05.05",
    title: {
      cn: "笨蛋花絮 01",
      en: "Silly Blooper 01",
    },
    description: {
      cn: "一些很难正经归档的搞笑证据。",
      en: "Funny evidence that refuses to be archived seriously.",
    },
    puzzleId: "magic-012",
    isGuestVisible: false,
    order: 12,
  },
  {
    id: "FUN-02",
    category: "bloopers",
    type: "video",
    status: "unlocked",
    date: "2025.05.18",
    title: {
      cn: "笨蛋花絮 02",
      en: "Silly Blooper 02",
    },
    description: {
      cn: "适合塞进胶卷里反复嘲笑的片段。",
      en: "A clip worth storing in the blooper reel.",
    },
    puzzleId: "magic-013",
    isGuestVisible: false,
    order: 13,
  },
  {
    id: "FUN-03",
    category: "bloopers",
    type: "audio",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "未公开花絮",
      en: "Locked Blooper",
    },
    description: {
      cn: "这段花絮还没被玩家挖出来。",
      en: "This blooper has not been discovered yet.",
    },
    puzzleId: "magic-014",
    isGuestVisible: false,
    order: 14,
  },
  {
    id: "AUD-01",
    category: "audio",
    type: "audio",
    status: "locked",
    date: "????.??.??",
    title: {
      cn: "录音倒带 01",
      en: "Audio Rewind 01",
    },
    description: {
      cn: "一段还锁在抽屉里的声音。",
      en: "A recording still locked inside the drawer.",
    },
    puzzleId: "magic-015",
    isGuestVisible: false,
    order: 15,
  },
];