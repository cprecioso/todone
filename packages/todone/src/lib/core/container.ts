import type { CheckerResult, Plugin } from "#/plugin";
import * as t from "#/types";

export class PluginError extends Error {
  constructor(pluginName: string, url: URL, cause: unknown) {
    super(`Plugin "${pluginName}" failed while checking ${url}`, { cause });
  }
}

export class UnhandledUrlError extends Error {
  constructor(match: t.Match) {
    const {
      url,
      file,
      position: { line, column },
    } = match;
    super(
      `No plugin returned a result for ${url} (${file.localPath}:${line}:${column}). ` +
        `Add a plugin that handles this URL, or set \`unhandledUrls: "warn"\` or \`"ignore"\` in your todone config.`,
    );
  }
}

/** Thrown internally when a plugin didn't recognize a URL. */
const UNHANDLED = Symbol("unhandled");

type FanOutHook =
  "warn" | "info" | "debug" | "reportFile" | "reportMatch" | "reportResult";

type CheckerPlugin = Plugin & Required<Pick<Plugin, "checkMatch">>;

/**
 * Holds all the plugins for a run and knows how to dispatch each hook to
 * them: {@link Plugin.checkMatch} races all checkers and settles on the first
 * one to recognize the URL, while the reporting hooks and disposal fan out to
 * every plugin implementing them.
 *
 * Each hook mirrors the name and signature of its {@link Plugin} counterpart.
 */
export class PluginContainer implements AsyncDisposable {
  readonly #plugins: readonly Plugin[];
  readonly #checkers: readonly CheckerPlugin[];

  constructor(plugins: readonly Plugin[]) {
    this.#plugins = plugins;
    this.#checkers = plugins.filter(
      (plugin): plugin is CheckerPlugin => plugin.checkMatch != null,
    );
  }

  #fanOut<K extends FanOutHook>(name: K) {
    type Item = Parameters<NonNullable<Plugin[K]>>[0];
    return async (item: Item): Promise<void> => {
      await Promise.all(
        this.#plugins.map((plugin) =>
          (plugin[name] as ((item: Item) => Promise<void>) | undefined)?.call(
            plugin,
            item,
          ),
        ),
      );
    };
  }

  readonly warn = this.#fanOut("warn");
  readonly info = this.#fanOut("info");
  readonly debug = this.#fanOut("debug");

  readonly reportFile = this.#fanOut("reportFile");
  readonly reportMatch = this.#fanOut("reportMatch");
  readonly reportResult = this.#fanOut("reportResult");

  readonly checkMatch = async ({
    url,
  }: {
    url: URL;
  }): Promise<CheckerResult | null> =>
    await Promise.any(
      this.#checkers.map((plugin) =>
        plugin.checkMatch({ url }).then(
          (result) => {
            if (result === null) throw UNHANDLED;
            return result;
          },
          (error) => {
            throw new PluginError(plugin.name, url, error);
          },
        ),
      ),
    ).then(
      (result) => result,
      (error): null => {
        if (error instanceof AggregateError) {
          const realErrors = error.errors.filter((e) => e !== UNHANDLED);
          if (realErrors.length === 0) return null;
          else if (realErrors.length === 1) throw realErrors[0];
          else
            throw new AggregateError(
              realErrors,
              `Multiple plugins failed while checking ${url}`,
            );
        } else throw error;
      },
    );

  async [Symbol.asyncDispose]() {
    await Promise.all(
      this.#plugins.map((plugin) => plugin[Symbol.asyncDispose]?.()),
    );
  }
}
