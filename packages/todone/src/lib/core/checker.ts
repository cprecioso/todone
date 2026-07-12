import type { Plugin } from "#/plugin";
import * as t from "#/types";

export class PluginError extends Error {
  constructor(pluginName: string, url: URL, cause: unknown) {
    super(`Plugin "${pluginName}" failed while checking ${url}`, { cause });
    this.name = "PluginError";
  }
}

/** Returned when no plugin recognized the URL. */
export const UNHANDLED = Symbol("unhandled");

export const makeAggregateChecker =
  (plugins: readonly Plugin[]) =>
  async (match: t.Match): Promise<t.Result | typeof UNHANDLED> => {
    const { url } = match;

    const settled = await Promise.allSettled(
      plugins.map((plugin) => plugin.checkMatch({ url })),
    );

    const errors = settled.flatMap((outcome, i) =>
      outcome.status === "rejected"
        ? [new PluginError(plugins[i]!.name, url, outcome.reason)]
        : [],
    );
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(
        errors,
        `Multiple plugins failed while checking ${url}`,
      );
    }

    for (const outcome of settled) {
      if (outcome.status === "fulfilled" && outcome.value != null) {
        return { url, match, result: outcome.value };
      }
    }

    return UNHANDLED;
  };
