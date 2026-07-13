import type { CheckerResult, Plugin } from "#/plugin";

export class PluginError extends Error {
  constructor(pluginName: string, url: URL, cause: unknown) {
    super(`Plugin "${pluginName}" failed while checking ${url}`, { cause });
  }
}

type FanOutHook =
  "warn" | "info" | "debug" | "reportFile" | "reportMatch" | "reportResult";

/**
 * Holds all the plugins for a run and knows how to dispatch each hook to
 * them: {@link Plugin.checkMatch} races all checkers and settles on the first
 * one to recognize the URL, while the reporting hooks and disposal fan out to
 * every plugin implementing them.
 *
 * Each hook mirrors the name and signature of its {@link Plugin} counterpart.
 */
export class PluginContainer implements AsyncDisposable {
  /** Thrown internally when a plugin didn't recognize a URL. */
  static readonly #UNHANDLED = Symbol("unhandled");

  readonly #plugins: readonly Plugin[];

  constructor(plugins: readonly Plugin[]) {
    this.#plugins = plugins;
  }

  #fanOut<K extends FanOutHook>(name: K) {
    type Args = Parameters<NonNullable<Plugin[K]>>;
    return async (...args: Args): Promise<void> => {
      await Promise.all(
        this.#plugins.map((plugin) =>
          (plugin[name] as ((...args: Args) => Promise<void>) | undefined)?.(
            ...args,
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
      this.#plugins
        .map((plugin) =>
          plugin.checkMatch?.({ url }).then(
            (result) => {
              if (result === null) throw PluginContainer.#UNHANDLED;
              return result;
            },
            (error) => {
              throw new PluginError(plugin.name, url, error);
            },
          ),
        )
        .filter((check) => check != null),
    ).then(
      (result) => result,
      (error): null => {
        if (error instanceof AggregateError) {
          const realErrors = error.errors.filter(
            (e) => e !== PluginContainer.#UNHANDLED,
          );
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
