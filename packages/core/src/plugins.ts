import type { PluginInstance } from "@todone/types";
import pMemoize from "p-memoize";
import type { Options } from "./options";

export class PluginContainer {
  readonly #options;
  constructor(options: Options) {
    this.#options = options;
  }

  #checkPattern(url: string, { pattern }: PluginInstance) {
    if (!pattern) return true;
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    for (const pattern of patterns) {
      if (pattern.test(url)) return true;
    }
    return false;
  }

  async #checkSinglePlugin(url: URL, plugin: PluginInstance) {
    if (!this.#checkPattern(url.toString(), plugin)) return null;
    return await plugin.check({ url });
  }

  check = pMemoize(
    async (url: URL) => {
      for (const plugin of this.#options.plugins) {
        try {
          const result = await this.#checkSinglePlugin(url, plugin);
          if (result) return result;
        } catch (err) {
          this.#options.warnLogger(
            `${plugin.name} errored while processing ${url.toString()}: ${err}`,
          );
        }
      }

      return null;
    },
    { cacheKey: ([url]) => url.toString() },
  );
}
