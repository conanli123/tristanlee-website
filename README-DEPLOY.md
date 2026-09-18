# 部署与更新说明

## 文件结构

- `dev.html`：Vite 源码入口；本地开发访问 `/dev.html`。
- `src/`：React + TypeScript 源码。
- `public/works/`：正式作品图片；`public/placeholders/`：尚待替换的占位素材。
- `single-file/index.html`：经验证的全内嵌网页。
- 根目录 `index.html`：由 `build:single` 自动同步的同一产物。
- `scripts/build-single.mjs`：编译、内嵌与同步。
- `scripts/verify-single.mjs`：脚本语法、媒体字节一致性与文件大小校验。
- `functions/`：公开点赞的 Cloudflare Pages Functions API。
- `migrations/`：点赞 D1 数据库迁移；`wrangler.jsonc`：Pages 项目与数据库绑定配置，Wrangler 自动读取。

当前有 25 件作品，其中 13 件 Lighting 作品使用用户提供的 `d1` 至 `d11`、`d13`、`d14` 图片，其余 12 件为占位。Lighting 分类包含深度翻页展示；阿凡提作品年份为 2017，其余新增年份按用户要求配置。

## 生成可发布文件

```sh
npm ci
npm run build:single
```

构建会将 CSS、JavaScript、favicon 和 `public/works/`、`public/placeholders/`、`public/animations/` 中的媒体内嵌。旧 `public/art/` 和 `public/media/` 不会进入单文件。HTML 必须小于 25 MiB；更大媒体建议改为外部托管并调整构建流程。

## 发布到 Cloudflare Pages

线上项目为 `tristanlee`，地址：https://tristanlee.pages.dev/ 。Cloudflare Pages 已连接 GitHub 仓库 `conanli123/tristanlee-website` 的 `main` 分支，构建命令为 `npm run build:single`，发布目录为 `single-file`。

更新时先运行 `npm run build:single` 验证，再提交并推送源文件、公开素材、生成的根目录 `index.html`、`functions/` 和数据库配置。Pages 会根据 `main` 的新提交重新构建 `single-file`，并编译根目录的 Functions，一起发布网页与 API。根目录 `index.html` 作为生成的独立网页提交保存；实际线上发布使用云端构建的 `single-file`。单独上传 HTML 不会部署公开点赞 API。

`wrangler.jsonc` 的输出目录为 `single-file`，配置项目名同为 `tristanlee`。需要显式直传时运行：

```sh
npm run deploy:pages
```

该命令会构建并发布到同一 Pages 项目。GitHub Actions 仅执行构建检查和保存产物；实际自动发布由 Cloudflare 的 GitHub 集成完成。

手动浏览：直接打开根 `index.html` 或 `single-file/index.html`。作品图片与文字可离线查看，本地收藏保存在浏览器中；公开点赞需要 API 与 D1，不能仅靠独立 HTML 同步。所有详情使用 hash 路由，可以分享和刷新。字体有在线 CDN 依赖；离线时回退到系统字体。

## 公开点赞数据库

- D1 数据库名称：`tristanlee-portfolio-likes`。
- D1 数据库 ID：`a00a1158-d4f2-4774-b3d5-294a21846477`。
- Pages 绑定名称：`LIKES_DB`，必须与 Functions 使用的环境绑定一致。
- API 使用匿名访客标识保存点赞，作品计数由数据库统一返回；星星收藏继续仅保存在访客自己的浏览器。

首次部署或新增数据库迁移时，在已登录 Cloudflare 的终端执行：

```sh
npm run db:migrate:remote
```

这个命令将仓库 `migrations/` 内尚未执行的迁移应用到线上数据库。数据库已创建时应复用上面的绑定，避免更换数据库导致原有点赞数不可见。

`wrangler.jsonc` 中的 `env.preview.d1_databases` 为空，因此云端 Preview 部署的公开点赞不可用。如需在 Preview 上测试点赞，请绑定独立的预览 D1 并执行相应迁移，避免把测试点赞写入生产数据库。

## 本地 API 预览

```sh
npm run build:single
npm run db:migrate:local
npm run dev:api
```

本地 Pages 地址为 http://localhost:8788 。`dev:api` 使用 `wrangler pages dev single-file --port 8788`，自动读取默认的 `wrangler.jsonc`。开发源码时另开终端运行 `npm run dev`，Vite 的 `/api` 代理会连接此服务。迁移脚本同样读取默认配置，针对 `LIKES_DB` 绑定执行；本地迁移使用 `--local`，线上迁移使用 `--remote`，两者数据独立。

## GitHub 项目仓库

完整项目保存在 https://github.com/conanli123/tristanlee-website ，主分支为 `main`。

仓库包括源码、公开素材、构建脚本、部署配置、依赖锁文件和根目录独立网页。`node_modules/`、`dist/`、`single-file/`、本地缓存及日志不提交；安装依赖并构建即可重新生成。

推送 `main` 会触发已配置的 Cloudflare Pages 自动部署。仓库中的 GitHub Actions 负责构建检查并保存独立网页产物。
