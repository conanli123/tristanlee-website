# 部署与更新说明（TristanLee 作品集）

## 结构

- `dev.html` — 开发/构建入口（Vite 从这里加载 `src/` 源码）。
- `src/` — React + TypeScript 源码（组件、样式、数据）。
- `single-file/index.html` — 由 `npm run build:single` 生成的全内嵌单文件（视频、图片全部 base64 内嵌，任何静态托管直接可用）。
- `index.html`（仓库根）— **生产单文件页**，内容等于 `single-file/index.html` 的副本，随 git 提交。
- `scripts/build-single.mjs` — 构建并校验单文件（内嵌 8 个媒体资源，字节级校验）。
- `wrangler.pages.jsonc` — Cloudflare Pages 直传配置。

## 本地开发

```bash
npm install
npm run dev        # 打开 http://127.0.0.1:5173/dev.html
```

## 构建生产单文件

```bash
npm run build:single   # tsc + vite build + 内嵌全部媒体 + 校验
# 产物：single-file/index.html
```

## 发布到公网（两种方式都可用）

### 方式一：推送 GitHub（自动更新，推荐）

Cloudflare Pages 项目 `tristanleelgt` 通过 GitHub 集成，无构建命令，直接发布仓库根目录。
因此**每次改完代码后执行**：

```bash
npm run build:single          # 重新生成单文件
Copy-Item single-file\index.html index.html   # 同步到仓库根生产页
git add -A && git commit -m "update" && git push origin main
```

推送后约 1~2 分钟，https://tristanleelgt.pages.dev 自动更新。
所有视频与交互动效都内嵌在 index.html 中，公网与本地效果一致，不会丢失。

### 方式二：wrangler 直传（立即生效，无需等构建）

```bash
npx wrangler pages deploy single-file --project-name tristanleelgt --branch main
```

## 注意

- 仓库根 `index.html` 是生产产物，不要手动编辑它；改内容请改 `src/` 后重新构建。
- 字体来自 Google Fonts CDN（Archivo + Noto Sans SC），需联网加载。
- 旧 worker 域名 `tristanlee.minkate689.workers.dev` 已不再更新；当前唯一公网地址为 `https://tristanleelgt.pages.dev`。
