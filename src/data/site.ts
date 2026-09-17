// 当前 16 个作品案例均为版式展示占位，不能作为真实项目经历或客户合作记录。
export const site = {
  name: "TristanLee",
  chineseName: "李天纯",
  title: "游戏渲染合成师",
  titleEn: "RENDERING & COMPOSITING ARTIST",
  email: "294080551@qq.com",
  video: "",
  heroIntro:
    "你好，我是李天纯 TristanLee，一名游戏行业的渲染合成师。关注光影、材质与色彩，让想象成为有情绪的画面。",
  heroIntroEn:
    "HELLO, I am TristanLee, a rendering & compositing artist in the games industry. I explore light, materials and color to shape the feeling of every frame.",
  profileLead: "我是李天纯 TristanLee，一名游戏行业的渲染合成师。",
  profileBody:
    "从场景灯光与角色渲染，到镜头合成与材质研究，我关注画面中每一层光影的关系。这里将整理我的视觉探索与作品，让过程和最终画面一起被看见。",
  workNotice:
    "当前 16 个作品案例及项目说明均为作品集版式占位，非实际客户项目；原创视频、游戏与插画作品将陆续补充。",
  workNoticeEn:
    "All 16 project examples are portfolio placeholders, not client projects. Original films, game demos and illustrations will follow.",
};

export type WorkKind = "image" | "video" | "game";
export type WorkGroup = "lighting" | "theater" | "games" | "illustration";

export type WorkCategory = {
  id: "all" | WorkGroup;
  en: string;
  zh: string;
  description: string;
};

export const workCategories: WorkCategory[] = [
  {
    id: "all",
    en: "All",
    zh: "全部作品",
    description: "光影、短片、游戏与插画，记录我的创作探索。",
  },
  {
    id: "lighting",
    en: "Lighting",
    zh: "场景灯光",
    description: "用灯光、色彩与氛围，描绘游戏世界的情绪。",
  },
  {
    id: "theater",
    en: "Mini Theater",
    zh: "小剧场",
    description: "游戏与影视合成视频，分享镜头叙事与画面制作过程。",
  },
  {
    id: "games",
    en: "Game Demos",
    zh: "游戏 Demo",
    description: "个人制作的小游戏，探索有趣的玩法与互动体验。",
  },
  {
    id: "illustration",
    en: "Art & Illustration",
    zh: "艺术插画",
    description: "个人游戏插画、场景设计原画，以及手绘风格的创作。",
  },
];

export type Work = {
  id: string;
  index: string;
  category: string;
  categoryEn: string;
  year: string;
  title: string;
  titleEn: string;
  image: string;
  kind: WorkKind;
  group: WorkGroup;
  description: string;
  details: string[];
  credit?: string;
  videoSrc?: string;
  demoUrl?: string;
};

type PlaceholderInput = Pick<
  Work,
  "id" | "index" | "category" | "categoryEn" | "title" | "titleEn" | "group"
> & {
  concept: string;
  process: string;
  kind?: WorkKind;
};

function placeholder(input: PlaceholderInput): Work {
  const { concept, process, kind = "image", ...work } = input;
  return {
    ...work,
    year: "2026",
    title: work.title,
    image: `placeholders/frame-${work.index}.svg`,
    kind,
    description: `${work.category}展示占位：${concept}非实际客户项目。`,
    details: ["此位置用于展示原创作品，当前图像与说明均为版式占位。", process],
    credit:
      "作品集展示占位 · 非实际客户项目 / PORTFOLIO PLACEHOLDER · NOT A CLIENT PROJECT",
  };
}

export const works: Work[] = [
  placeholder({
    id: "luminous-ruins",
    index: "01",
    category: "场景灯光",
    categoryEn: "SCENE LIGHTING",
    title: "晨光遗迹",
    titleEn: "LUMINOUS RUINS",
    group: "lighting",
    concept: "晨光穿过建筑，勾勒空间的尺度与安静的氛围。",
    process: "后续可补充光源布局、体积光设置及最终画面对比。",
  }),
  placeholder({
    id: "portrait-study",
    index: "02",
    category: "小游戏案例",
    categoryEn: "GAME DEMO",
    title: "星际快递",
    titleEn: "ORBIT COURIER",
    kind: "game",
    group: "games",
    concept:
      "预留给太空运输小游戏的玩法与画面展示，目前为计划中的案例占位，尚未提供可游玩版本。",
    process: "后续可补充操作说明、玩法演示、开发记录与试玩入口。",
  }),
  placeholder({
    id: "atmosphere-layers",
    index: "03",
    category: "游戏合成短片",
    categoryEn: "GAME CINEMATIC",
    title: "失落之城",
    titleEn: "THE LOST CITY",
    kind: "video",
    group: "theater",
    concept:
      "预留给游戏场景短片，探索雾、光与景深的镜头层次；目前为计划中的案例占位，视频待补充。",
    process: "后续可补充完整短片、分层素材、合成节点与制作前后对比。",
  }),
  placeholder({
    id: "neon-night",
    index: "04",
    category: "场景灯光",
    categoryEn: "SCENE LIGHTING",
    title: "霓虹夜色",
    titleEn: "NEON NIGHT",
    group: "lighting",
    concept: "冷暖光源、反射与夜景色彩的视觉探索。",
    process: "后续可补充冷暖光源设计、反射控制与场景照明过程。",
  }),
  placeholder({
    id: "material-library",
    index: "05",
    category: "小游戏案例",
    categoryEn: "GAME DEMO",
    title: "光路谜题",
    titleEn: "LIGHTPATH PUZZLE",
    kind: "game",
    group: "games",
    concept:
      "预留给以光线与反射为主题的解谜小游戏，目前为计划中的案例占位，尚未提供可游玩版本。",
    process: "后续可补充解谜规则、关卡设计、制作过程与试玩入口。",
  }),
  placeholder({
    id: "color-script",
    index: "06",
    category: "影视合成短片",
    categoryEn: "FILM COMPOSITING",
    title: "霓虹追逐",
    titleEn: "NEON CHASE",
    kind: "video",
    group: "theater",
    concept:
      "预留给夜景叙事短片，探索调色与合成如何建立镜头情绪；目前为计划中的案例占位，视频待补充。",
    process: "后续可补充完整视频、调色方向、合成分解与镜头版本对比。",
  }),
  placeholder({
    id: "forest-light",
    index: "07",
    category: "场景灯光",
    categoryEn: "ENVIRONMENT LIGHTING",
    title: "林间光隙",
    titleEn: "FOREST LIGHT",
    group: "lighting",
    concept: "林间散射光、柔和阴影与自然色彩的观察。",
    process: "后续可补充自然光方向、环境色与空气透视的制作过程。",
  }),
  placeholder({
    id: "hard-surface",
    index: "08",
    category: "小游戏案例",
    categoryEn: "GAME DEMO",
    title: "像素冲刺",
    titleEn: "PIXEL DASH",
    kind: "game",
    group: "games",
    concept:
      "预留给节奏轻快的跑酷小游戏，目前为计划中的案例占位，尚未提供可游玩版本。",
    process: "后续可补充移动与跳跃机制、关卡节奏、开发记录与试玩入口。",
  }),
  placeholder({
    id: "frame-assembly",
    index: "09",
    category: "游戏合成短片",
    categoryEn: "GAME CINEMATIC",
    title: "异星信号",
    titleEn: "DISTANT SIGNAL",
    kind: "video",
    group: "theater",
    concept:
      "预留给科幻游戏影像，探索渲染通道与特效层的整合；目前为计划中的案例占位，视频待补充。",
    process: "后续可补充完整短片、渲染通道、光影调整与特效合成分解。",
  }),
  placeholder({
    id: "silent-interior",
    index: "10",
    category: "场景灯光",
    categoryEn: "INTERIOR LIGHTING",
    title: "静谧室内",
    titleEn: "SILENT INTERIOR",
    group: "lighting",
    concept: "窗光、反射光与暗部细节共同塑造空间。",
    process: "后续可补充窗光构图、间接照明与画面曝光的处理。",
  }),
  placeholder({
    id: "cloth-and-skin",
    index: "11",
    category: "小游戏案例",
    categoryEn: "GAME DEMO",
    title: "森林花园",
    titleEn: "FOREST GARDEN",
    kind: "game",
    group: "games",
    concept:
      "预留给轻松的花园互动小游戏，目前为计划中的案例占位，尚未提供可游玩版本。",
    process: "后续可补充互动规则、场景制作、开发记录与试玩入口。",
  }),
  placeholder({
    id: "final-frame",
    index: "12",
    category: "影视合成短片",
    categoryEn: "FILM COMPOSITING",
    title: "终章之光",
    titleEn: "LIGHT AFTER",
    kind: "video",
    group: "theater",
    concept:
      "预留给以光影与色彩收束情绪的短片；目前为计划中的案例占位，视频待补充。",
    process: "后续可补充完整视频、原始渲染、合成阶段与最终画面的对照。",
  }),
  placeholder({
    id: "illustration-world",
    index: "13",
    category: "游戏插画",
    categoryEn: "GAME ILLUSTRATION",
    title: "浮岛来信",
    titleEn: "LETTERS FROM SKY ISLAND",
    group: "illustration",
    concept:
      "预留给个人游戏世界的叙事插画，探索漂浮岛屿、建筑与角色之间的故事。",
    process: "后续可补充原创完成图、构图草稿、配色探索与绘制过程。",
  }),
  placeholder({
    id: "environment-concept",
    index: "14",
    category: "场景设计原画",
    categoryEn: "ENVIRONMENT CONCEPT",
    title: "暮色车站",
    titleEn: "DUSK STATION",
    group: "illustration",
    concept: "预留给游戏场景设计原画，探索建筑结构、空间层次与暮色氛围。",
    process: "后续可补充场景设计稿、构图缩略图、空间推敲与色彩方案。",
  }),
  placeholder({
    id: "hand-painted-study",
    index: "15",
    category: "手绘风格探索",
    categoryEn: "HAND-PAINTED STUDY",
    title: "林间手记",
    titleEn: "FOREST SKETCHBOOK",
    group: "illustration",
    concept: "预留给手绘风格画，探索自然形态、笔触质感与自由的色彩表达。",
    process: "后续可补充原创手绘作品、线稿、笔刷实验与上色过程。",
  }),
  placeholder({
    id: "character-illustration",
    index: "16",
    category: "角色插画",
    categoryEn: "CHARACTER ILLUSTRATION",
    title: "星野旅人",
    titleEn: "STARFIELD TRAVELER",
    group: "illustration",
    concept: "预留给个人游戏角色插画，探索角色轮廓、服饰细节与叙事姿态。",
    process: "后续可补充原创角色完成图、造型草稿、配色与局部细节。",
  }),
];

export const skillTags = [
  { zh: "场景灯光", en: "SCENE LIGHTING" },
  { zh: "角色渲染", en: "CHARACTER RENDERING" },
  { zh: "镜头合成", en: "COMPOSITING" },
  { zh: "材质研究", en: "LOOK DEVELOPMENT" },
  { zh: "色彩与氛围", en: "COLOR & MOOD" },
];

export const newsItems = [
  {
    id: "site-opening",
    date: "2026.09.17",
    title: "个人作品集网站开张",
    en: "The portfolio is now open",
    body: "李天纯 TristanLee 的个人作品集于今天上线。这里将记录场景灯光、角色渲染、镜头合成与材质研究。",
  },
  {
    id: "work-update-plan",
    date: "2026.09.17",
    title: "作品与制作过程更新计划",
    en: "Original work and process notes to follow",
    body: "目前的项目内容为展示占位。后续将逐步补充原创作品、制作说明与合成前后对比。",
  },
];

export const mediaTiles = works.slice(0, 6).map((work) => work.image);
