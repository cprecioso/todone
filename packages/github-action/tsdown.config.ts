import { nodeCli } from "@todone/internal-build/tsdown";
import { defineConfig } from "tsdown";

export default [
  defineConfig({
    ...nodeCli(),
    deps: {
      alwaysBundle: () => true,
      onlyBundle: false,
    },
  }),
];
