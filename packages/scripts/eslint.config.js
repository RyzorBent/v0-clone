import baseConfig from "@project-4/config-eslint";

export default [
  {
    ignores: ["templates/**"],
  },
  ...baseConfig,
  {
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
    },
  },
];
