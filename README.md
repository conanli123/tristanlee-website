# 李天纯 TristanLee · 游戏渲染合成师

以 https://doisena.jp/ 的排版与交互为参考，使用 React、TypeScript、Vite 重建的个人作品集。

项目仓库：https://github.com/conanli123/tristanlee-website

## 本地预览

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:5173/dev.html 。开发入口为 `dev.html`；根目录 `index.html` 是构建好的独立网页。

## 页面和功能

- 首页：8 个方形作品轮播，鼠标停留在两侧作品上会将其移至中央，支持鼠标拖动、触屏横滑、箭头与圆点切换、自动播放；下方 WORK 与独立作品页默认均显示 Lighting 的放大深度轮播，另有个人名片、动态、视觉札记、联系区和大字页脚。
- 作品列表、29 个作品详情、分类筛选、中英文关键词搜索。
- 分类为 Lighting、Mini Theater、Game Demos、Art & Illustration；全部分类同排显示，窄屏可横向滚动。WORK 标题悬停或键盘聚焦时逐字填入不同颜色。
- 首页滚动与顶部导航、手机菜单联动：HOME、WORK、PROFILE、NEWS、CONTACT 会按当前位置高亮；在首页点击导航滚动到同一区块，保留轮播与分类状态。`#/home?section=work` 等地址支持刷新、前进后退恢复对应位置。独立详情页与 MUSIC、FAQ 仍可直接打开。
- MUSIC：球场与唱片风格的七首歌单。四首本地嘻哈/放克支持背景播放、随机/顺序切歌、进度、音量及静音；新增《快乐崇拜》《八方来财》《花花公子》使用 Apple Music 官方播放器提供平台试听及完整收听入口，选择时自动暂停背景音乐。全站悬浮播放器在路由切换时连续播放本地曲目。首次访问随机选曲并尝试播放，浏览器禁止有声自动播放时等待首次点击/按键或播放按钮；记住主动暂停、静音、音量与随机模式。
- 本地收藏（localStorage）与公开点赞：星星保存本机收藏，爱心通过 Cloudflare Pages Functions + D1 保存共享点赞数，所有访客可以查看。匿名点赞无需登录。
- 个人介绍、新闻列表与文章、合作 FAQ、邮箱联系和隐私说明。
- 桌面、平板和手机布局，手机底部菜单，键盘操作及减少动态效果支持。
- 名片随滚动倾斜转正、回弹和上下漂浮；页脚分层花束摇摆、人物漂浮和背景格纹移动，离开视口暂停。

Lighting 的十七件作品采用用户提供的 d1–d17 图片，包括日式暮色街道、装甲载具、齿轮工坊、2018 年《小破孩之大状元》电影、2017 年阿凡提集市、晶谷远征，以及新增的 2016 年《怪物猎人》、星夜旅居、2024 年《熊出没》和霓虹女武者。WORK 默认打开 Lighting，也可直接访问 `#/work?category=lighting`；分类写入地址，刷新后保留。Lighting 仅保留 GSAP 深度翻页展示，不再重复平铺作品；All、其他分类和收藏页仍使用网格。

轮播基于用户提供的 React Bits DepthCarousel 源码，主图最大宽度从 420px 放大至 720px，保留 21:16 比例，手机主图占轮播宽度的 78%。纵深参数为 depth 230、spread 180（小屏自动收窄）、tilt 18、perspective 1200、falloff 0.18、radius 19、duration 650ms。每 3.2 秒自动翻页，悬停、键盘聚焦、离开视口及后台标签页暂停；支持播放开关、拖动、触屏、滚轮、键盘、箭头和圆点。点击后方卡片将其移到中央，再点击进入详情，标题、收藏和点赞同步当前作品。减少动态效果模式关闭自动播放。

其他 12 件仍使用 SVG 占位视觉，人物插画也是头像占位。占位项目不代表实际客户合作或个人项目经历；短片与游戏详情均显示待补充状态。此前的旧图片和视频保留在磁盘，页面和独立网页不再使用。

## 更换内容

- `src/data/site.ts`：姓名、职业、邮箱、作品、新闻及技能。
- `public/works/lighting/d1.webp` 至 `d17.webp`：十七张灯光作品，按源图比例压缩为 WebP；详情页按原始比例完整展示。未指定的作品年份按用户要求分散在 2019–2026，《怪物猎人》为 2016，《小破孩之大状元》电影为 2018，阿凡提集市为 2017，《熊出没》为 2024，均为展示年份而非图片元数据。
- `public/placeholders/frame-01.svg` 至 `frame-16.svg`：现有占位视觉，可替换为真实作品；若换扩展名，同步修改 `image` 字段及验证脚本。
- `src/App.tsx`：页面、组件、路由和交互。
- `src/hooks/useProfileMotion.ts`：名片滚动动效。
- `src/components/FlowerScene.tsx` / `flower-scene.css`：页脚花束动效。
- `public/animations/flowers/`：按复刻需求本地保存的原站花束图层；来源见该目录 `SOURCES.md`。
- `src/index.css`：样式、响应式与动效。
- `src/data/assetUrl.ts`：素材地址解析，兼容开发模式与独立网页。
- `src/data/music.ts`：本地背景曲目和官方平台试听曲目的标题、作者与来源；`public/music/`：四首 Kevin MacLeod 的 CC BY 4.0 音乐和来源记录。完整本地曲目仅转码为 128 kbps MP3；MUSIC 页提供署名、曲目来源与授权链接。三首平台曲目不加入本地随机播放池，也不纳入 CC 授权；完整播放及可用地区由 Apple Music 决定，《花花公子》在其国际目录显示为 Crush On You (feat. step.jad)。
- `src/components/MusicProvider.tsx`：跨页面音频状态、播放策略、偏好存储和进度控制；`MusicPage.tsx` / `music.css`：歌单与悬浮播放器。
- `src/hooks/useSectionNavigation.ts`：首页区块导航、滚动高亮和历史恢复。
- `functions/`：公开点赞的 Cloudflare Pages API；`migrations/`：D1 数据库结构迁移。
- `wrangler.jsonc`：Cloudflare Pages 输出目录与 D1 绑定配置，Wrangler 自动读取此默认文件。

所有作品图通过 `assetUrl()` 读取。正式作品放在 `public/works/`，占位素材放在 `public/placeholders/`；单文件构建会自动内嵌这两个目录内支持的图片和视频。作品的 `isPlaceholder` 字段决定是否显示占位提示。个人信息沿用现有邮箱 `294080551@qq.com`。

作品的 `group` 对应 `lighting / theater / games / illustration`，`kind` 对应 `image / video / game`。视频作品补充 `videoSrc` 后显示原生播放器，可用 `placeholders/` 下的视频路径或 HTTPS 视频直链；小游戏补充 `demoUrl` 后显示新窗口试玩入口。未填链接时保留待补充提示。作品数据中填写真实内容后，也请同步更新占位说明与项目状态。

## 构建

```sh
npm run build         # TypeScript 检查 + 标准 Vite 构建，输出 dist/dev.html
npm run build:single  # 内嵌脚本、样式和作品素材，校验并同步根目录 index.html
```

开发服务启动后，运行 `npm run test:carousel` 检查深度翻页的画面位置、循环切换、自动播放、收藏点赞同步及桌面/触屏布局。测试默认使用本机 Microsoft Edge；可通过 `PLAYWRIGHT_CHANNEL` 更换浏览器，通过 `PORTFOLIO_TEST_URL` 指定独立网页或部署地址。点赞请求在交互测试中模拟，不写入线上数据库。

`single-file/index.html` 和根目录 `index.html` 是相同的可直接打开的网页。图片和作品内容可离线查看，公开点赞需要运行 API 服务；字体通过 Google Fonts 加载，离线时使用系统字体。音乐独立按需加载，构建时复制至 `single-file/music/`，移动或分享构建文件时须一并保留该目录；根目录 HTML 从 `public/music/` 读取本地音乐。每次只加载当前曲目，避免把整个歌单内嵌到首屏 HTML。详情页面采用 hash 路由，无需服务器路由重写。

`npx playwright test tests/browser/navigation-music.spec.ts` 验证导航联动、实际音频播放、快进、随机播放、自动播放受限后的恢复、暂停记忆及手机布局。测试地址配置同轮播测试。

## 本地测试点赞

```sh
npm run build:single
npm run db:migrate:local
npm run dev:api
```

以上在 http://localhost:8788 启动 Pages 预览和本地 D1。另开终端运行 `npm run dev`，Vite 会将 `/api` 转发到 `localhost:8788`，可在开发页面调试点赞。只运行 Vite 或直接打开 HTML 时，作品浏览与本地收藏仍可使用，但不会生成共享点赞数。本地数据库与线上数据库彼此独立。

推送 GitHub `main` 后，Cloudflare Pages 自动执行 `npm run build:single`，发布 `single-file` 并编译根目录 `functions/`。根目录 `index.html` 仍作为生成的独立网页提交保存。生产环境绑定公开点赞数据库；云端 Preview 环境未绑定 D1，因此预览部署的点赞不可用，需另配预览数据库后启用。

部署配置与操作见 [README-DEPLOY.md](README-DEPLOY.md)。
