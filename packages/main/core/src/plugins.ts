import { assert } from "@std/assert";
import type { Match, PluginFactory, PluginInstance } from "@todone/types";
import type { TodoneOptions } from "./options";
import { truthy } from "./util/bool";

const getPluginName = (plugin: PluginFactory) =>
  plugin.displayName || plugin.name;

const makePlugin = async (
  plugin: PluginFactory,
  { toleratePluginInstantiationErrors, warnLogger }: TodoneOptions,
) => {
  try {
    return [plugin, await plugin.make()] as const;
  } catch (err) {
    if (!toleratePluginInstantiationErrors) throw err;
    warnLogger(`${getPluginName(plugin)} will be disabled due to:`);
    warnLogger("" + err);
    warnLogger("");
  }
};

class PluginContainer {
  static async make(plugins: readonly PluginFactory[], options: TodoneOptions) {
    const entries = await Promise.all(
      plugins.map((plugin) => makePlugin(plugin, options)),
    );
    const instances = new Map(entries.filter(truthy));
    return new this(instances, options);
  }

  private constructor(
    public readonly instances: ReadonlyMap<PluginFactory, PluginInstance>,
    public readonly options: TodoneOptions,
  ) {}

  #checkPattern(url: string, { pattern }: PluginFactory | PluginInstance) {
    if (!pattern) return true;
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    for (const pattern of patterns) {
      if (pattern.test(url)) return true;
    }
    return false;
  }

  async #checkSinglePlugin(match: Match, url: string, plugin: PluginFactory) {
    if (!this.#checkPattern(url, plugin)) return null;

    const pluginInstance = this.instances.get(plugin);
    assert(pluginInstance);
    if (!this.#checkPattern(url, pluginInstance)) return null;

    return await pluginInstance.check(match);
  }

  async check(match: Match) {
    const urlString = match.url.href;
    for (const plugin of this.instances.keys()) {
      try {
        const result = await this.#checkSinglePlugin(match, urlString, plugin);
        if (result) return result;
      } catch (err) {
        this.options.warnLogger(
          `${getPluginName(plugin)} errored while processing ${urlString}:`,
        );
        this.options.warnLogger("" + err);
        this.options.warnLogger("");
      }
    }

    return null;
  }
}

export const makePluginContainer = PluginContainer.make.bind(PluginContainer);
