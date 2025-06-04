/** @type {import('prettier').Config} */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "<TYPES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "<TYPES>^@project-4",
    "^@project-4-v0/(.*)$",
    "",
    "<TYPES>^[.|..|~]",
    "^~/",
    "^[../]",
    "^[./]",
  ],
};

module.exports = config;
