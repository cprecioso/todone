import * as pkg from "#/package.json" with { type: "json" };
import * as t from "#/types";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as GroupBy from "effect/GroupBy";
import * as Stream from "effect/Stream";
import { Analyzer } from "./analyzer";
import { PluginChecker } from "./plugins/checker";

/**
 * The runner service provides methods to analyze streams of files and matches.
 */
export class Runner extends Effect.Service<Runner>()(`${pkg.name}/Runner`, {
  dependencies: [Analyzer.Default, PluginChecker.Default],
  effect: Effect.gen(function* () {
    const analyzer = yield* Analyzer;
    const pluginChecker = yield* PluginChecker;

    return {
      /**
       * Finds and returns a stream of matches from a stream of files.
       */
      getMatches: <E, R>(stream: Stream.Stream<t.File, E, R>) =>
        Stream.flatMap(stream, analyzer.findMatches),

      /**
       * Analyzes a stream of matches and returns a stream of results.
       */
      getResults: <E, R>(stream: Stream.Stream<t.Match, E, R>) =>
        pipe(
          stream,
          Stream.groupByKey((item) => item.url.toString()),
          GroupBy.evaluate((url, stream) =>
            Stream.runCollect(stream).pipe(
              Effect.andThen(Chunk.toReadonlyArray),
              Effect.andThen((matches) => ({ url: new URL(url), matches })),
              Stream.fromEffect,
            ),
          ),
          Stream.mapEffect(
            ({ url, matches }) =>
              Effect.map(pluginChecker.checkMatch(url), (result) => ({
                url,
                result,
                matches,
              })),
            {},
          ),
        ),
    };
  }),
}) {}
