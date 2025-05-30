import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        // target: "https://unistar.icu",
        target: "http://192.168.162.160:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.startsWith('/api') ? `/api/${path.slice(4)}` : path
      },
    },
  },
});
