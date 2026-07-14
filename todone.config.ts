/// <reference types="node" />

import datePlugin from "@todone/plugin-date";
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  keyword: "*TODO",
  // Test files and fixtures may contain literal `*TODO` markers on purpose;
  // keep the dogfood run (.github/workflows/todone.yaml) away from them.
  globs: ["**/*", "!**/*.test.ts", "!**/__snapshots__/**", "!packages/*/test/**"],
  plugins: [datePlugin(), githubPlugin()],
});
