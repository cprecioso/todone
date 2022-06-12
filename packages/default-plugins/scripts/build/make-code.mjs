// @ts-check

import slugify from "@sindresorhus/slugify";
import assert from "node:assert";
import { format } from "./format.mjs";

const PLUGIN_RE = /^@todone\/plugin-(.+)$/;

export const makeCode = (/** @type {string[]} */ allDeps) => {
  const deps = allDeps
    .filter((name) => PLUGIN_RE.test(name))
    .map((name) => {
      const match = name.match(PLUGIN_RE);
      assert(match); // To make TypeScript happy
      const key = match[1];
      const id = slugify(key, { separator: "_" });
      return { name, key, id };
    });

  const code = `
    ${deps.map((dep) => `import ${dep.id} from "${dep.name}";`).join("")}

    import type { PluginInstance } from "@todone/types"
    type PluginFn = () => PluginInstance

    export const allPlugins: PluginFn[] = [${deps
      .map((dep) => dep.id)
      .join(",")}];

    export const pluginsByName: Record<string, PluginFn> = {${deps
      .map((dep) => dep.id)
      .join(",")}};
  `;

  return format(code);
};
