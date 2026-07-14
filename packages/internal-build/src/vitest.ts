import type { ViteUserConfig } from "vitest/config";

export interface VitestConfigOptions {
  /** Paths to setup files, resolved relative to the package root. */
  setupFiles?: readonly string[];
}

export const defaultConfig = ({ setupFiles = [] }: VitestConfigOptions = {}) =>
  ({
    test: {
      include: ["src/**/*.test.ts", "test/**/*.test.ts"],
      environment: "node",

      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,

      // Deterministic output: chalk checks FORCE_COLOR before NO_COLOR, and
      // date formatting depends on the timezone.
      env: { TZ: "UTC", NO_COLOR: "1", FORCE_COLOR: "0" },

      setupFiles: [...setupFiles],
    },
  }) satisfies ViteUserConfig;
