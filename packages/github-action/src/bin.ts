import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { Options, Runner } from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as input from "./input";
import { GitHubFile, makeFileStream } from "./lib/files";
import { GitHubAPI } from "./lib/issues/actions";
import { reconcileIssues } from "./lib/issues/reconciler";
import { syncChanges } from "./lib/output/issues";
import { AnalysisLogger } from "./lib/output/logger";
import { outputToSummary } from "./lib/output/summary";
import { makePlugins } from "./lib/plugins";

const main = Effect.gen(function* () {
  const options = Layer.effect(
    Options,
    Effect.map(makePlugins(defaultPlugins), (plugins) => ({
      keyword: input.keyword,
      plugins,
    })),
  );

  const layer = Layer.mergeAll(
    Runner.Default,
    input.dryRun ? GitHubAPI.DryRun : GitHubAPI.Default,
    AnalysisLogger.Default,
  ).pipe(Layer.provide(options));

  return yield* pipe(
    Effect.gen(function* () {
      const runner = yield* Runner;

      return yield* pipe(
        makeFileStream(input.globs),

        Stream.tap(AnalysisLogger.logFile),

        runner.getMatches<GitHubFile.E, GitHubFile.R, GitHubFile>(),

        Stream.tap(AnalysisLogger.logMatch),

        runner.getResults<GitHubFile.E, GitHubFile.R, GitHubFile>(),

        Stream.tap(AnalysisLogger.logResult),

        reconcileIssues,

        syncChanges,

        outputToSummary,
      );
    }),
    Effect.provide(layer),
    Effect.scoped,
  );
});

pipe(
  main,
  Effect.scoped,
  Effect.provide(Layer.mergeAll(NodeHttpClient.layer, NodeContext.layer)),
  NodeRuntime.runMain,
);
