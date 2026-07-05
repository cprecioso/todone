import type { UserConfig } from "tsdown";

export const defaultConfig = ({ entries = ["index"] } = {}) =>
  ({
    entry: entries.map((entry) => `src/${entry}.ts`),

    outDir: "dist",
    clean: true,
    format: ["esm"],
    fixedExtension: false,

    platform: "node",
    target: "node24",

    sourcemap: true,
    dts: {
      sourcemap: true,
    },
  }) satisfies UserConfig;
