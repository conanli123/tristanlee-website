# 部署与更新说明

## 文件结构

- `dev.html`：Vite 源码入口；本地开发访问 `/dev.html`。
- `src/`：React + TypeScript 源码。
- `public/works/`：正式作品图片；`public/placeholders/`：尚待替换的占位素材。
- `single-file/index.html`：经验证的全内嵌网页。
- 根目录 `index.html`：由 `build:single` 自动同步的同一产物。
- `scripts/build-single.mjs`：编译、内嵌与同步。
- `scripts/verify-single.mjs`：脚本语法、媒体字节一致性与文件大小校验。

## 生成可发布文件

```sh
npm ci
npm run build:single
```

构建会将 CSS、JavaScript、favicon 和 `public/works/`、`public/placeholders/`、`public/animations/` 中的媒体内嵌。旧 `public/art/` 和 `public/media/` 不会进入单文件。HTML 必须小于 25 MiB；更大媒体建议改为外部托管并调整构建流程。

## 发布到 Cloudflare Pages

仓库保留的配置项目名为 `tristanleelgt`，`wrangler.pages.jsonc` 输出目录为 `single-file`。显式直传命令：

```sh
npm run deploy:pages
```

该命令会构建并发布到配置的 Pages 项目。若使用现有 GitHub 集成，应在 Cloudflare 控制台确认当前实际设置：

- 直接发布仓库根：构建后提交根 `index.html`。
- 在云端构建：构建命令为 `npm run build:single`，输出目录为 `single-file`。

本地文件无法确认云端采用哪一种配置。GitHub Actions 目前仅执行构建检查和保存产物。

手动浏览：直接打开根 `index.html` 或 `single-file/index.html`。所有详情使用 hash 路由，可以分享和刷新。字体有在线 CDN 依赖；离线时回退到系统字体。

## GitHub 项目仓库

完整项目保存在 https://github.com/conanli123/tristanlee-website ，主分支为 `main`。

仓库包括源码、公开素材、构建脚本、部署配置、依赖锁文件和根目录独立网页。`node_modules/`、`dist/`、`single-file/`、本地缓存及日志不提交；安装依赖并构建即可重新生成。

上传仓库本身不会调用 Cloudflare 部署命令。仓库中的 GitHub Actions 负责构建检查并保存独立网页产物。
