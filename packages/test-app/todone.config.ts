/// <reference types="node" />

import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  globs: ["./input/**/*"],
  unhandledUrls: "warn",
  plugins: [githubPlugin()],
});
