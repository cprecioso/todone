import * as t from "@todone/types";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as GroupBy from "effect/GroupBy";
import * as Stream from "effect/Stream";
import * as pkg from "../package.json" assert { type: "json" };
import { Analyzer, RunnerMatch } from "./analyzer";
import { PluginRunner } from "./plugins";

export class Runner extends Effect.Service<Runner>()(`${pkg.name}/Runner`, {
  dependencies: [Analyzer.Default, PluginRunner.Default],
  effect: Effect.gen(function* () {
    const analyzer = yield* Analyzer;
    const runner = yield* PluginRunner;

    return {
      getMatches:
        <FE, FR, TFile extends t.File<FE, FR>>() =>
        <E, R>(stream: Stream.Stream<TFile, E, R>) =>
          Stream.flatMap(stream, analyzer.findMatches<FE, FR, TFile>()),

      getResults:
        <TFile extends t.File<unknown, unknown>>() =>
        <E, R>(stream: Stream.Stream<RunnerMatch<TFile>, E, R>) =>
          stream.pipe(
            Stream.groupByKey((item) => item.url.toString()),
            GroupBy.evaluate((url, stream) =>
              Stream.runCollect(stream).pipe(
                Effect.andThen(Chunk.map((item) => item.match)),
                Effect.andThen(Chunk.toReadonlyArray),
                Effect.andThen((matches) => ({ url: new URL(url), matches })),
                Stream.fromEffect,
              ),
            ),
            Stream.mapEffect(({ url, matches }) =>
              runner
                .check(url)
                .pipe(Effect.andThen((result) => ({ url, result, matches }))),
            ),
          ),
    };
  }),
}) {}
