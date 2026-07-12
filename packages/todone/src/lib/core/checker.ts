import type { Plugin, Reporter } from "#/plugin";
import * as t from "#/types";
import { UnhandledUrls } from "../config/schema";

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

/** Returned when no plugin recognized the URL. */
const UNHANDLED = Symbol("unhandled");

export const makeAggregateChecker =
  (
    plugins: readonly Plugin[],
    {
      unhandledUrls,
      reporter,
    }: { unhandledUrls: UnhandledUrls; reporter: Reporter },
  ) =>
  async (match: t.Match): Promise<t.Result> => {
    const { url } = match;

    const result = await Promise.any(
      plugins.map((plugin) =>
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
      (result): t.Result => ({ url, match, result }),
      (error): typeof UNHANDLED | never => {
        if (error instanceof AggregateError) {
          const realErrors = error.errors.filter((e) => e !== UNHANDLED);
          if (realErrors.length === 0) return UNHANDLED;
          else if (realErrors.length === 1) throw realErrors[0];
          else
            throw new AggregateError(
              realErrors,
              `Multiple plugins failed while checking ${url}`,
            );
        } else throw error;
      },
    );

    if (result !== UNHANDLED) return result;

    switch (unhandledUrls) {
      case "error":
        throw new UnhandledUrlError(match);
      case "warn":
        await reporter.warn(
          `no plugin handled ${match.url} (${match.file.localPath}:${match.position.line}:${match.position.column})`,
        );
      // fallthrough
      case "ignore":
        return { url: match.url, match, result: null };
      default:
        return unhandledUrls satisfies never;
    }
  };
