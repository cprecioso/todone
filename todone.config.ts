/// <reference types="node" />

import { defineConfig } from "todone/config";

export default defineConfig({
  keyword: "*TODO",
  plugins: {
    "@todone/plugin-date": {},
    "@todone/plugin-github": {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    },
  },
});
