/// <reference types="node" />

import { defineConfig } from "todone/config";

export default defineConfig({
  globs: ["./input/**/*"],
  plugins: {
    "@todone/plugin-github": {},
  },
});
