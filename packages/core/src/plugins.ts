import type { Match, PluginInstance } from "@todone/types";
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

  async #checkSinglePlugin(match: Match, url: string, plugin: PluginInstance) {
    if (!this.#checkPattern(url, plugin)) return null;
    return await plugin.check(match);
  }

  async check(match: Match) {
    const urlString = match.url.href;
    for (const plugin of this.#options.plugins) {
      try {
        const result = await this.#checkSinglePlugin(match, urlString, plugin);
        if (result) return result;
      } catch (err) {
        this.#options.warnLogger(
          `${plugin.name} errored while processing ${urlString}: ${err}`,
        );
      }
    }

    return null;
  }
}
