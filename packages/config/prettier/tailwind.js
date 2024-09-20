const config = require("./index.js");

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const configWithTailwind = {
  ...config,
  plugins: [...config.plugins, "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
  tailwindConfig: "./tailwind.config.ts",
};

module.exports = configWithTailwind;
