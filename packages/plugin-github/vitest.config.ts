import { defaultConfig } from "@todone/internal-build/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig(defaultConfig({ setupFiles: ["./test/setup.ts"] }));
