# 部署与更新

## 已发布网站



* Cloudflare Pages: [https://tristanleelgt.pages.dev/](https://tristanleelgt.pages.dev/)

* Workers 备用地址: [https://tristanlee.minkate689.workers.dev/](https://tristanlee.minkate689.workers.dev/)

Pages 已连接 GitHub 仓库 `conanli123/website` 的 `main` 分支。构建命令是 `npm run build:single`，输出目录为 `single-file`。推送后自动构建并发布，无需额外的 GitHub Secrets。本地保存文件只会更新本地预览；提交并推送后才会更新公网，通常需要几分钟。

## 日常更新



```
npm run dev

npm run build:single

git add .

git commit -m "Update portfolio"

git push origin main
```

`single-file/index.html` 是构建产物，不要手动编辑或提交。它可以直接在浏览器中打开预览。

手动发布到 Pages：`npm run deploy:pages`。

手动更新 Workers 备用地址：`npm run deploy`。两个托管项目共用同一个单文件构建流程。

## 素材和交互



* 视频：`public/media/character.mp4`，推荐 MP4 / H.264 /yuv420p。

* 图片：`public/art/`。

* 所有本地素材通过 `src/data/assetUrl.ts` 的 `assetUrl('相对路径')` 读取。

* 单文件构建自动发现 public 里的视频和图片，将其与 CSS、JavaScript 一起内嵌。外部 URL 不会自动内嵌。

* 构建会校验内嵌素材与源文件逐字节一致，检查脚本语法，检查没有开发入口或外部应用脚本。

* Cloudflare Pages 单个资源上限为 25 MiB，内嵌 Base64 会增大文件。长视频应使用专用视频托管并在网站里引用，不适合塞入单个 HTML。

* 浏览器的编解码能力、网络、减少动态效果设置仍会影响播放，构建成功不能替代实际浏览器验证。

## 自定义域名

用户已确认购买 `cgtalk.dev`。绑定 `tristanlee.cgtalk.dev` 仍需在域名管理平台设置正确的 DNS，并等待 Cloudflare HTTPS 证书生效。DNS 查询无结果并不等于域名未注册。