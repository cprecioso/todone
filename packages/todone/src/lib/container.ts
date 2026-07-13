import type { CheckerResult, Plugin, PluginOption } from "#/plugin";
import type * as t from "#/types";

export class PluginError extends Error {
  constructor(pluginName: string, url: URL, cause: unknown) {
    super(`Plugin "${pluginName}" failed while checking ${url}`, { cause });
  }
}

type FanOutHook =
  "warn" | "info" | "debug" | "reportFile" | "reportMatch" | "reportResult";

/**
 * Holds all the plugins for a run and knows how to dispatch each hook to
 * them: {@link PluginContainer.checkMatch} races all checkers and settles on
 * the first one to recognize the URL, while the reporting hooks and disposal
 * fan out to every plugin implementing them.
 *
 * The reporting hooks mirror the name and signature of their {@link Plugin}
 * counterparts; `checkMatch` instead takes a whole {@link t.Match} and
 * bundles the outcome as a {@link t.Result}.
 */
export class PluginContainer implements Required<Plugin> {
  /** Thrown internally when a plugin didn't recognize a URL. */
  static readonly #UNHANDLED = Symbol("unhandled");

  readonly name = "todone:plugin-container";

  readonly #plugins: readonly Plugin[];

  constructor(plugins: readonly PluginOption[]) {
    this.#plugins =
      // @ts-expect-error
      plugins.flat(Infinity) as readonly Plugin[];
  }

  #fanOut<K extends FanOutHook>(name: K) {
    return async (
      ...args: Parameters<NonNullable<Plugin[K]>>
    ): Promise<void> => {
      await Promise.all(
        this.#plugins.map((plugin) =>
          (plugin[name] as Plugin[K])?.call(
            this,
            // @ts-expect-error
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

  readonly checkMatch = async (
    match: t.Match,
  ): Promise<CheckerResult | null> => {
    const { url } = match;

    const result = await Promise.any(
      this.#plugins
        .map((plugin) =>
          plugin.checkMatch?.call(this, { url }).then(
            (result) => {
              if (result === null) throw PluginContainer.#UNHANDLED;
              return result;
            },
            (error) => {
              throw new PluginError(plugin.name, url, error);
            },
          ),
        )
        .filter((checkPromise) => checkPromise != null),
    ).catch((error): null => {
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
    });

    return result;
  };

  async [Symbol.asyncDispose]() {
    await Promise.all(
      this.#plugins.map((plugin) => plugin[Symbol.asyncDispose]?.call(this)),
    );
  }
}
