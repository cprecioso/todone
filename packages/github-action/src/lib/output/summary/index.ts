import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { IssueSyncResult } from "../issues";
import { generateRow, SUMMARY_TABLE_HEADER } from "./row";

export const outputToSummary = <E, R>(
  results: Stream.Stream<IssueSyncResult, E, R>,
) =>
  pipe(
    results,
    Stream.mapEffect(
      IssueSyncResult.$match({
        Invalid: ({ value: { issue } }) =>
          toArray(
            generateRow({
              actionMessage: "Closed (invalid)",
              issueNumber: issue.number,
            }),
          ),

        LocalOnly: ({ value: { result, syncResult } }) =>
          mapEffect(result.matches, (match) =>
            generateRow({
              url: result.url.toString(),
              match,
              result: result.result,
              issueNumber: syncResult || undefined,
              actionMessage: "Created",
            }),
          ),

        NotTriggered: ({ value: { result } }) =>
          mapEffect(result.matches, (match) =>
            generateRow({
              url: result.url.toString(),
              match,
              result: result.result,
              actionMessage: "Waiting",
            }),
          ),

        Orphaned: ({ value: { issue, issueData } }) =>
          toArray(
            generateRow({
              url: issueData.todoUrl,
              issueNumber: issue.number,
              actionMessage: "Closed (completed)",
            }),
          ),

        RemoteMatched: ({ value: { issue, result } }) =>
          mapEffect(result.matches, (match) =>
            generateRow({
              url: result.url.toString(),
              match,
              result: result.result,
              issueNumber: issue.number,
              actionMessage: "Updated",
            }),
          ),
      }),
    ),
    Stream.flattenIterables,
    Stream.runCollect,
    Effect.flatMap((tableDefinition) =>
      Effect.tryPromise(() =>
        core.summary
          .addHeading("TODOs found")
          .addTable([SUMMARY_TABLE_HEADER, ...tableDefinition])
          .write(),
      ),
    ),
    Effect.asVoid,
  );

const mapEffect = <A, B, E, R>(
  arr: Iterable<A>,
  fn: (value: A) => Effect.Effect<B, E, R>,
) => Effect.all(Array.from(arr, fn));

const toArray = <A, E, R>(
  eff: Effect.Effect<A, E, R>,
): Effect.Effect<[A], E, R> => Effect.map(eff, (value) => [value]);
