# 李天纯 TristanLee

React、TypeScript、Vite 作品网站，包含首页、图片作品、小剧场、游戏 Demo、自我介绍和联系方式。

## 本地预览

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:5173/ 。`npm run build` 生成标准 Vite 产物；`npm run build:single` 生成包含当前图片、视频、样式和交互的 `single-file/index.html`，可直接在浏览器打开。

## 发布

GitHub `main` 分支推送后，Cloudflare Pages 自动运行 `npm run build:single`，发布 `single-file` 目录到 https://tristanleelgt.pages.dev/ 。

手动发布 Pages 使用 `npm run deploy:pages`；更新 Workers 备用站点使用 `npm run deploy`。参阅 [部署指南](README-DEPLOY.md)。

## 更换内容

- `src/data/site.ts`：姓名、职业、邮箱、介绍和图片作品数据。
- `src/App.tsx`：页面区块、视频卡片和游戏 Demo。
- `src/index.css`：样式和响应式规则。
- `public/art/`：图片与视频封面。
- `public/media/character.mp4`：首页交互视频及小剧场占位视频。
- `src/data/assetUrl.ts`：统一的素材地址解析，用于本地预览和单文件发布。

当前作品图是明确标注的风格参考，非个人作品。小剧场暂时复用首页短片。替换原创素材时也需更新名称、说明与素材来源。
