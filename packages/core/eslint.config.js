import drizzle from "eslint-plugin-drizzle";

import baseConfig from "@project-4-v0/config-eslint";

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    plugins: {
      drizzle,
    },
    rules: drizzle.configs.recommended.rules,
  },
  {
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
];
