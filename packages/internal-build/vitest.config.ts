// Bootstrap: import the source directly (same pattern as ./tsdown.config.ts)
// so this package's own tests don't require a prior build of itself.
import { defineConfig } from "vitest/config";
import { defaultConfig } from "./src/vitest.ts";

export default defineConfig(defaultConfig());
