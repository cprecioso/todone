import { nodeCli } from "@todone/build/tsdown";
import { defineConfig } from "tsdown";

export default defineConfig({
  ...nodeCli(),
  noExternal: () => true,
});
