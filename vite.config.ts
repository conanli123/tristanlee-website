import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 开发/构建入口为 dev.html；仓库根 index.html 是已构建的单文件生产页（供 Cloudflare Pages 直接发布）。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  build: {
    rollupOptions: {
      input: { index: "dev.html" },
    },
  },
  server: {
    open: "/dev.html",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
        configure(proxy) {
          // Keep the local Pages API's origin check valid through Vite.
          proxy.on("proxyReq", (proxyRequest, request) => {
            if (request.headers.origin === `http://${request.headers.host}`) {
              proxyRequest.setHeader("Origin", "http://127.0.0.1:8788");
            }
          });
        },
      },
    },
  },
});
