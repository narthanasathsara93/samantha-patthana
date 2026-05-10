import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
  ],

  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          hls: ["hls.js"],
        },
      },
    },
  },
});