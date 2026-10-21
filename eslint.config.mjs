// eslint.config.mjs
import pluginVue from "eslint-plugin-vue";
import { withVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

export default withVueTs(
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "vue/block-lang": "off",
    },
    ignores: [
      "assets/fonts",
      "coverage",
      ".nyc_output",
      "node_modules/",
      ".npm",
      ".eslintcache",
      ".env",
      ".cache",
      ".next",
      ".nuxt",
      "dist",
      "dist-pkg",
      ".DS_Store",
      "dynamic-importer.js",
      "ksconfig.json",
      "nuxt.config.js",
      "shell/utils/dynamic-importer.js",
      "shell/assets/fonts",
      "tmp",
    ],
  },
);
