import type { UserConfig } from "tsdown";

export const library = ({ entries = ["index"] } = {}) =>
  ({
    entry: entries.map((entry) => `src/${entry}.ts`),

    outDir: "dist",
    clean: true,
    format: ["esm"],
    fixedExtension: false,

    platform: "neutral",

    sourcemap: true,
    dts: {
      sourcemap: true,
    },
  }) satisfies UserConfig;

export const nodeLibrary = (...args: Parameters<typeof library>) =>
  ({
    ...library(...args),

    platform: "node",
    target: "node24",
  }) satisfies UserConfig;

export const nodeCli = (...[opts, ...args]: Parameters<typeof nodeLibrary>) =>
  ({
    ...nodeLibrary({ entries: ["bin"], ...opts }, ...args),
    dts: false,
  }) satisfies UserConfig;
