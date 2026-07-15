import * as attw from "@arethetypeswrong/core";
import * as publint from "publint";
import * as publintUtils from "publint/utils";
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

    publint: {
      enabled: true,
      module: [publint, publintUtils],
      strict: true,
    },
    attw: {
      enabled: true,
      module: attw,
      profile: "esm-only",
      level: "error",
    },
  }) satisfies UserConfig;
