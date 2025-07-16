import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: '0.0.0.0',     // 🔓 Allow access from other devices
    port: 5173,          // 🌐 Or any port you like
  },
  plugins: [
    vue(), // This must be first
    vueDevTools(),
  ],
});

