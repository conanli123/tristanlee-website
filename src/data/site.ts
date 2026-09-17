// Lighting 已更新为用户提供的 4 张场景作品，其余 12 个案例仍为版式展示占位。
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
    "Lighting 收录四幅场景光影作品；其余 12 个视频、游戏与插画案例目前为展示占位，内容将陆续更新。",
  workNoticeEn:
    "Lighting features four environment artworks. The remaining 12 film, game and illustration entries are placeholders, with more work to follow.",
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
  imageAlt?: string;
  imagePosition?: string;
  isPlaceholder: boolean;
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
    isPlaceholder: true,
    kind,
    description: `${work.category}展示占位：${concept}非实际客户项目。`,
    details: ["此位置用于展示原创作品，当前图像与说明均为版式占位。", process],
    credit:
      "作品集展示占位 · 非实际客户项目 / PORTFOLIO PLACEHOLDER · NOT A CLIENT PROJECT",
  };
}

// Lighting 年份按用户要求在 2019–2026 年间分散设置，为展示年份，非图片元数据。
export const works: Work[] = [
  {
    id: "luminous-ruins",
    index: "01",
    category: "场景灯光",
    categoryEn: "SCENE LIGHTING",
    title: "炉火与天光",
    titleEn: "HEARTH & DAYLIGHT",
    year: "2020",
    image: "works/lighting/d1.webp",
    imageAlt:
      "木梁与石墙构成的古朴酒馆，左侧窗光照亮桌椅，右侧壁炉与烛火泛出暖光。",
    imagePosition: "54% 50%",
    isPlaceholder: false,
    kind: "image",
    group: "lighting",
    description:
      "天光穿过左侧的菱格窗，落在木桌、长凳与旧地板上。右侧石砌壁炉和零星烛火点亮室内，让这间木梁与石墙围合的酒馆呈现出安静而温暖的气息。",
    details: [
      "偏冷的窗光与偏暖的炉火形成画面的两组光源关系。轻薄的空气感柔化远处的吧台与木桶，近处桌面的亮部则保留清晰的木纹与器皿轮廓。",
      "前景桌椅、中央过道与后方吧台构成逐层深入的空间。厚重木梁下的阴影、石墙的粗糙表面和壁炉边的金色反光，共同呈现旧酒馆的材质与生活温度。",
    ],
    credit: "场景灯光作品 / SCENE LIGHTING PORTFOLIO",
  },
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
  {
    id: "neon-night",
    index: "04",
    category: "场景灯光",
    categoryEn: "SCENE LIGHTING",
    title: "蓝调摩天轮",
    titleEn: "BLUE HOUR WHEEL",
    year: "2023",
    image: "works/lighting/d2.webp",
    imageAlt:
      "夜色中的摩天轮以青蓝与淡紫灯带勾勒轮廓，潮湿广场映出灯光，远处建筑隐入薄雾。",
    imagePosition: "50% 50%",
    isPlaceholder: false,
    kind: "image",
    group: "lighting",
    description:
      "深蓝夜空下，青蓝与淡紫色的灯带沿着摩天轮铺展，明亮的圆形结构成为广场的视觉中心。空旷的地面、静止的座舱与远处薄雾，让游乐场呈现出夜幕降临后的宁静。",
    details: [
      "画面采用接近对称的正面构图，以摩天轮的放射线条和地面铺装引导视线。潮湿路面接住冷色灯光，在前景形成柔和反射，将主体与广场空间联系起来。",
      "两侧路灯和建筑窗边的暖光为蓝色环境提供细微对比。背景楼群逐渐融入雾气，保留城市的尺度，同时让轮缘、支架与灯带的层次更加鲜明。",
    ],
    credit: "场景灯光作品 / SCENE LIGHTING PORTFOLIO",
  },
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
  {
    id: "forest-light",
    index: "07",
    category: "场景灯光",
    categoryEn: "ENVIRONMENT LIGHTING",
    title: "光落圣所",
    titleEn: "SANCTUARY OF LIGHT",
    year: "2019",
    image: "works/lighting/d3.webp",
    imageAlt:
      "金色阳光穿过圆形天窗，照亮苔藓覆盖的石砌遗迹与中央祭台，地面散落陶罐和碎石。",
    imagePosition: "57% 50%",
    isPlaceholder: false,
    kind: "image",
    group: "lighting",
    description:
      "金色日光从圆形天窗倾泻而下，穿过空气中的微尘，照亮遗迹中央的石制祭台。四周的苔藓、垂落的旧布与残损石墙围合出一处被森林慢慢收回的古老空间。",
    details: [
      "天窗光束将视线引向中央祭台与层叠台阶，后方拱门透入的柔光则打开空间纵深。明亮的暖色光区与两侧深色石柱相互映衬，使主体从厚重的建筑阴影中显现。",
      "前景破碎的陶罐、散落石块与蜿蜒植物保留丰富的细节。光线掠过石材边缘和青苔表面，柔和的空气透视将近处的暗部与远处林景连接起来，留下静谧而庄重的氛围。",
    ],
    credit: "场景灯光作品 / SCENE LIGHTING PORTFOLIO",
  },
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
  {
    id: "silent-interior",
    index: "10",
    category: "场景灯光",
    categoryEn: "ENVIRONMENT LIGHTING",
    title: "森林低语",
    titleEn: "FOREST WHISPERS",
    year: "2025",
    image: "works/lighting/d4.webp",
    imageAlt:
      "阳光透过茂密树冠洒入森林，古树根部与倒木覆着青苔，蘑菇和蕨叶散布在林地间。",
    imagePosition: "50% 50%",
    isPlaceholder: false,
    kind: "image",
    group: "lighting",
    description:
      "高大的树干围出一片幽静林地，阳光穿过树冠，落在覆满青苔的树根、岩石与横卧的倒木上。蘑菇和蕨叶散布其间，让森林的宏大尺度与贴近地面的细小生命同处一个画面。",
    details: [
      "斑驳日光沿着树皮与苔藓表面铺开，亮处呈现温暖的黄绿色，阴影则保留沉静的深绿。透入林间的光束与薄雾拉开前后层次，让密集的植被仍然具有清楚的空间关系。",
      "两侧树干形成自然的画框，横向倒木稳住构图，前景的小径与根系将视线带入深处。蘑菇的暖褐色、潮湿苔藓与粗糙树皮，为整体绿色环境增添细腻的色彩和质感变化。",
    ],
    credit: "场景灯光作品 / SCENE LIGHTING PORTFOLIO",
  },
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
    body: "Lighting 已更新四幅场景光影作品，涵盖酒馆室内、摩天轮夜景、石砌遗迹与自然森林。其余 12 个视频、游戏与插画案例目前为展示占位，后续将陆续补充作品与制作说明。",
  },
];

export const mediaTiles = works.slice(0, 6).map((work) => work.image);
