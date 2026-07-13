import type {
  CheckerResult,
  Plugin,
  PluginContext,
  PluginOption,
  Reporter,
} from "#/plugin";
import type * as t from "#/types";
import type { SetRequired } from "type-fest";

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
    this.#plugins =
      // @ts-expect-error
      plugins.flat(Infinity) as readonly Plugin[];
  }

  warn = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.warn?.call(this, message));

  info = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.info?.call(this, message));

  debug = (message: string) =>
    this.#plugins.forEach((plugin) => plugin.debug?.call(this, message));

  makeReporter = async (): Promise<Reporter> => {
    await using stack = new AsyncDisposableStack();
    const reporters = await Promise.all(
      this.#plugins
        .filter(
          (plugin): plugin is SetRequired<Plugin, "makeReporter"> =>
            plugin.makeReporter != null,
        )
        .map(async (plugin) => stack.use(await plugin.makeReporter.call(this))),
    );

    const newStack = stack.move();

    return {
      async file(file) {
        await Promise.all(
          reporters.map((reporter) => reporter.file?.call(this, file)),
        );
      },
      async match(match) {
        await Promise.all(
          reporters.map((reporter) => reporter.match?.call(this, match)),
        );
      },
      async result(result) {
        await Promise.all(
          reporters.map((reporter) => reporter.result?.call(this, result)),
        );
      },
      async error(error) {
        await Promise.all(
          reporters.map((reporter) => reporter.error?.call(this, error)),
        );
      },
      async [Symbol.asyncDispose]() {
        await newStack.disposeAsync();
      },
    };
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
