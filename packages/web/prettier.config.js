import config from "@project-4/config-prettier";

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  ...config,
  plugins: [...config.plugins, "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
  tailwindConfig: "./tailwind.config.ts",
};
