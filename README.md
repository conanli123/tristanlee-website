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

- 首页：8 个方形作品轮播，支持鼠标拖动、触屏横滑、箭头与圆点切换、自动播放；四列作品、个人名片、动态、视觉札记、联系区和大字页脚。
- 作品列表、16 个作品详情、分类筛选、中英文关键词搜索。
- 分类为 Lighting、Mini Theater、Game Demos、Art & Illustration；插画分类单独一行，WORK 标题悬停或键盘聚焦时逐字填入不同颜色。
- 本地收藏（localStorage）、个人介绍、新闻列表与文章、合作 FAQ、邮箱联系和隐私说明。
- 桌面、平板和手机布局，手机底部菜单，键盘操作及减少动态效果支持。
- 名片随滚动倾斜转正、回弹和上下漂浮；页脚分层花束摇摆、人物漂浮和背景格纹移动，离开视口暂停。

所有 16 张作品图都是新制作的 SVG 占位视觉，人物插画也是头像占位。占位项目不代表实际客户合作或个人项目经历。短片与游戏详情均显示待补充状态。旧图片和视频保留在磁盘，但页面和独立网页不再使用。

## 更换内容

- `src/data/site.ts`：姓名、职业、邮箱、作品、新闻及技能。
- `public/placeholders/frame-01.svg` 至 `frame-16.svg`：现有占位视觉，可替换为真实作品；若换扩展名，同步修改 `image` 字段及验证脚本。
- `src/App.tsx`：页面、组件、路由和交互。
- `src/hooks/useProfileMotion.ts`：名片滚动动效。
- `src/components/FlowerScene.tsx` / `flower-scene.css`：页脚花束动效。
- `public/animations/flowers/`：按复刻需求本地保存的原站花束图层；来源见该目录 `SOURCES.md`。
- `src/index.css`：样式、响应式与动效。
- `src/data/assetUrl.ts`：素材地址解析，兼容开发模式与独立网页。

所有作品图通过 `assetUrl()` 读取。新素材请放在 `public/placeholders/`，单文件构建会自动内嵌该目录内支持的图片和视频。个人信息沿用现有邮箱 `294080551@qq.com`。

作品的 `group` 对应 `lighting / theater / games / illustration`，`kind` 对应 `image / video / game`。视频作品补充 `videoSrc` 后显示原生播放器，可用 `placeholders/` 下的视频路径或 HTTPS 视频直链；小游戏补充 `demoUrl` 后显示新窗口试玩入口。未填链接时保留待补充提示。作品数据中填写真实内容后，也请同步更新占位说明与项目状态。

## 构建

```sh
npm run build         # TypeScript 检查 + 标准 Vite 构建，输出 dist/dev.html
npm run build:single  # 内嵌脚本、样式和作品素材，校验并同步根目录 index.html
```

`single-file/index.html` 和根目录 `index.html` 是相同的可直接打开的网页。字体通过 Google Fonts 加载；离线时使用系统字体。详情页面采用 hash 路由，无需服务器路由重写。

部署配置与操作见 [README-DEPLOY.md](README-DEPLOY.md)。上传 GitHub 用于保存和更新项目；网站托管需按部署说明配置。
