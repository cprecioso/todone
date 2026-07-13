import type {
  CheckerResult,
  Plugin,
  PluginContext,
  PluginOption,
} from "#/plugin";
import type * as t from "#/types";

export class PluginError extends Error {
  constructor(pluginName: string, url: URL, cause: unknown) {
    super(`Plugin "${pluginName}" failed while checking ${url}`, { cause });
  }
}

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
export class PluginContainer implements PluginContext {
  /** Thrown internally when a plugin didn't recognize a URL. */
  static readonly #UNHANDLED = Symbol("unhandled");

  readonly name = "todone:plugin-container";

  readonly #plugins: readonly Plugin[];

  constructor(plugins: readonly PluginOption[]) {
    this.#plugins = (plugins as readonly Plugin[]).flat(Infinity);
  }

  warn = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.warn?.call(this, message));

  info = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.info?.call(this, message));

  debug = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.debug?.call(this, message));

  reportFile = async (file: t.File) => {
    await Promise.all(
      this.#plugins.map((plugin) => plugin.reportFile?.call(this, file)),
    );
  };

  reportMatch = async (match: t.Match) => {
    await Promise.all(
      this.#plugins.map((plugin) => plugin.reportMatch?.call(this, match)),
    );
  };

  reportResult = async (result: t.Result) => {
    await Promise.all(
      this.#plugins.map((plugin) => plugin.reportResult?.call(this, result)),
    );
  };

  reportEnd = async (error?: unknown) => {
    await Promise.all(
      this.#plugins.map((plugin) => plugin.reportEnd?.call(this, error)),
    );
  };

  checkMatch = async ({ url }: { url: URL }): Promise<CheckerResult | null> => {
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
}
