// 在这里替换站点名、邮箱和图片作品。当前图片是他人作品的视觉参考。
export const site = {
  name: 'TristanLee',
  chineseName: '李天纯',
  title: '渲染合成师',
  email: '294080551@qq.com',
  emailIsPlaceholder: false,
  introduction: '用光影建立情绪，用合成完成叙事。欢迎来到我的视觉作品与动态影像空间。',
  video: `${import.meta.env.BASE_URL}media/character.mp4`,
  // 原始视频来自用户提供的参考提示词。
  videoSource: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4',
}

export type Project = {
  id: string
  number: string
  name: string
  subtitle: string
  category: string
  image: string
  color: string
  description: string
  details: string[]
  tags: string[]
  credit: string
  url?: string
}

export const projects: Project[] = [
  {
    id: 'wuthering-waves', number: '01', name: 'WUTHERING WAVES', subtitle: '鸣潮',
    category: '二次元', image: 'art/wuthering-waves.jpg', color: '#b4bfd3',
    description: '清透的光影、角色轮廓与大气空间层次。',
    details: ['这组视觉关注二次元角色与三维场景之间的融合，利用空气透视、轮廓光与色彩分区建立空间关系。', '当前图片选自《鸣潮》的官方 Steam 商店截图，仅作为渲染合成方向的临时视觉参考，非李天纯的个人作品，之后可替换为原创项目。'],
    tags: ['角色渲染', '环境光影', '色彩合成'],
    credit: 'Wuthering Waves © KURO GAMES · 官方商店截图',
    url: 'https://store.steampowered.com/app/3513350/',
  },
  {
    id: 'elden-ring', number: '02', name: 'ELDEN RING', subtitle: '艾尔登法环',
    category: '魂系写实', image: 'art/elden-ring.jpg', color: '#979878',
    description: '厚重材质、遗迹尺度与克制的电影化照明。',
    details: ['这组视觉关注写实材质与环境氛围，通过低照度、局部高光和空间雾组织观看视线。', '当前图片选自《艾尔登法环》的官方 Steam 商店截图，仅作为渲染合成方向的临时视觉参考，非李天纯的个人作品，之后可替换为原创项目。'],
    tags: ['写实材质', '氛围照明', '电影合成'],
    credit: 'ELDEN RING © FromSoftware / Bandai Namco · 官方商店截图',
    url: 'https://store.steampowered.com/app/1245620/',
  },
  {
    id: 'kena', number: '03', name: 'BRIDGE OF SPIRITS', subtitle: '凯娜：精神之桥',
    category: '动画电影感', image: 'art/kena.jpg', color: '#819e91',
    description: '让角色像刚刚从动画电影的画面里走出来。',
    details: ['这组视觉关注风格化角色、柔和体积光与丰富的环境色，用合成加强角色表演和镜头情绪。', '当前图片选自《凯娜：精神之桥》的官方 Steam 商店截图，仅作为 3D 动画电影感的临时视觉参考，非李天纯的个人作品，之后可替换为原创项目。'],
    tags: ['风格化 3D', '角色灯光', '动画电影感'],
    credit: 'Kena: Bridge of Spirits © Ember Lab · 官方商店截图',
    url: 'https://store.steampowered.com/app/1954200/',
  },
]
