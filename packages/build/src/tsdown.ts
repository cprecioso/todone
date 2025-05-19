import type { Options } from "tsdown";

export const library = ({ entries = ["index"] } = {}) =>
  ({
    entry: entries.map((entry) => `src/${entry}.ts`),

    outDir: "dist",
    clean: true,
    format: ["esm"],

    platform: "neutral",

    dts: {
      sourcemap: true,
    },
    sourcemap: true,
  }) satisfies Options;

export const nodeLibrary = (...args: Parameters<typeof library>) =>
  ({
    ...library(...args),

    platform: "node",
    target: "node22",
  }) satisfies Options;

export const nodeCli = (...[opts, ...args]: Parameters<typeof nodeLibrary>) =>
  ({
    ...nodeLibrary({ entries: ["bin"], ...opts }, ...args),
    dts: false,
  }) satisfies Options;
