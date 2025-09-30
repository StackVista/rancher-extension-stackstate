import { fileURLToPath } from "node:url";
import { configDefaults } from "vitest/config";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default {
  plugins: [vue()],
  resolve: {
    alias: {
      "@shell": "@rancher/shell",
      "@components": "@rancher/componentse",
    },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    root: fileURLToPath(new URL("./", import.meta.url)),
  },
};
