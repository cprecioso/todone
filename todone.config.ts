/// <reference types="node" />

import datePlugin from "@todone/plugin-date";
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  keyword: "*TODO",
  plugins: [datePlugin(), githubPlugin()],
});
