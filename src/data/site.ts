// 站点信息与作品数据 —— 替换这里即可更新名字、邮箱与作品内容。
export const site = {
  name: 'TristanLee',
  chineseName: '李天纯',
  title: '渲染合成师',
  titleEn: 'RENDERING & COMPOSITING ARTIST',
  email: '294080551@qq.com',
  video: 'media/character.mp4',
  heroIntro:
    '你好，我是李天纯 TristanLee，一名渲染合成师。用光影建立情绪，用合成完成叙事——让每一帧，都拥有自己的情绪。',
  heroIntroEn:
    'HELLO WORLD, this is the portfolio site of TristanLee, a rendering & compositing artist based in Xiamen. I craft lighting, materials, color and composition to give every frame its own emotion.',
  profileLead: '你好，我是李天纯 TristanLee，一名关注最终画面质感与叙事氛围的渲染合成师。',
  profileBody:
    '我喜欢研究光如何塑造空间、色彩怎样带来情绪，以及不同图层如何在合成阶段成为一幅完整的画面。这个网站用来整理静帧、影片与实时视觉实验。',
}

export type WorkKind = 'image' | 'video' | 'game'
export type WorkGroup = 'image' | 'motion' | 'game'

export type Work = {
  id: string
  index: string
  category: string
  categoryEn: string
  year: string
  title: string
  titleEn: string
  image: string
  kind: WorkKind
  group: WorkGroup
  description: string
  details: string[]
  credit?: string
}

export const works: Work[] = [
  {
    id: 'kena', index: '01', category: '动画电影感', categoryEn: 'ANIMATED CINEMA', year: '2026',
    title: '凯娜：精神之桥', titleEn: 'KENA — BRIDGE OF SPIRITS',
    image: 'art/kena.jpg', kind: 'image', group: 'image',
    description: '让角色像刚刚从动画电影的画面里走出来。',
    details: ['风格化角色、柔和体积光与丰富的环境色，用合成加强角色表演和镜头情绪。', '当前图片为风格参考素材，个人原创静帧作品陆续更新中。'],
    credit: 'KENA: Bridge of Spirits © Ember Lab · 风格参考素材',
  },
  {
    id: 'elden-ring', index: '02', category: '魂系写实', categoryEn: 'SOULS REALISM', year: '2026',
    title: '艾尔登法环', titleEn: 'ELDEN RING',
    image: 'art/elden-ring.jpg', kind: 'image', group: 'image',
    description: '厚重材质、遗迹尺度与克制的电影化照明。',
    details: ['关注写实材质与环境氛围，通过低照度、局部高光和空间雾组织观看视线。', '当前图片为风格参考素材，个人原创静帧作品陆续更新中。'],
    credit: 'ELDEN RING © FromSoftware / Bandai Namco · 风格参考素材',
  },
  {
    id: 'wuthering-waves', index: '03', category: '二次元', categoryEn: 'ANIME STYLE', year: '2026',
    title: '鸣潮', titleEn: 'WUTHERING WAVES',
    image: 'art/wuthering-waves.jpg', kind: 'image', group: 'image',
    description: '清透的光影、角色轮廓与大气空间层次。',
    details: ['关注二次元角色与三维场景之间的融合，利用空气透视、轮廓光与色彩分区建立空间关系。', '当前图片为风格参考素材，个人原创静帧作品陆续更新中。'],
    credit: 'Wuthering Waves © KURO GAMES · 风格参考素材',
  },
  {
    id: 'character-study', index: '04', category: '动态影像', categoryEn: 'MOTION', year: '2026',
    title: '角色印象短片', titleEn: 'CHARACTER STUDY',
    image: 'media/char-01.jpg', kind: 'video', group: 'motion',
    description: '黑发短发角色 · 灯光 / 表情 / 质感。',
    details: ['角色灯光、表情与质感的表现练习。', '更多影片、动画与合成 Breakdown 将陆续发布。'],
  },
  {
    id: 'light-catch', index: '05', category: '游戏原型', categoryEn: 'GAME DEMO', year: '2026',
    title: '光点捕捉', titleEn: 'LIGHT CATCH',
    image: 'art/wuthering-waves.jpg', kind: 'game', group: 'game',
    description: '一个可以在页面里直接试玩的小游戏。',
    details: ['15 秒内，点击尽可能多的移动光点，看看你能拿多少分。', '实时视觉实验：在浏览器里验证交互与反馈节奏。'],
  },
  {
    id: 'space-explore', index: '06', category: '游戏原型', categoryEn: 'GAME DEMO', year: '2026',
    title: '空间探索', titleEn: 'SPACE EXPLORE',
    image: 'art/elden-ring.jpg', kind: 'game', group: 'game',
    description: '在光线与阴影中，找到通向下一帧的入口。',
    details: ['空间探索小游戏原型：用光影引导路径、暗示出口。', '原型展示位，正式版本开发中。'],
  },
]

export const skillTags = [
  { zh: '灯光与渲染', en: 'LIGHTING & RENDERING' },
  { zh: '镜头合成', en: 'COMPOSITING' },
  { zh: '色彩与氛围', en: 'COLOR & MOOD' },
  { zh: '3D 动画影像', en: 'MOTION' },
  { zh: '实时视觉实验', en: 'REALTIME' },
]

export const newsItems = [
  { date: '2026.09.17', title: '网站重构：编辑排版风格上线，中英双语', en: 'Site rebuilt with an editorial design, bilingual CN / EN' },
  { date: '2026.09.16', title: '角色印象短片更新：黑发短发角色', en: 'New character study film with black short hair' },
  { date: '2026.09.10', title: '单文件部署完成：视频与动效全部内嵌', en: 'Single-file deployment: video & motion fully embedded' },
  { date: '2026.08.30', title: '新企划：实时视觉实验系列开启', en: 'New series: realtime visual experiments' },
]

export const mediaTiles = [
  'art/kena.jpg',
  'media/char-01.jpg',
  'art/wuthering-waves.jpg',
  'media/char-02.jpg',
  'art/elden-ring.jpg',
  'media/char-03.jpg',
]
