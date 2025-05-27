import { nodeCli } from "@todone/internal-build/tsdown";
import { defineConfig } from "tsdown";

export default [
  defineConfig({
    ...nodeCli(),
    noExternal: /./,
  }),
];
