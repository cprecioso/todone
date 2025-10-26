import * as Chunk from "effect/Chunk";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import { identity, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import { isExpiredResult, Result } from "../util/result";
import { GitHubAPI } from "./actions";
import { getIssueData } from "./issue-data";

export type IssueSyncStatus = Stream.Stream.Success<
  ReturnType<typeof reconcileIssues>
>;

export const IssueSyncStatus = Data.taggedEnum<IssueSyncStatus>();

export const reconcileIssues = <E, R>(result$: Stream.Stream<Result, E, R>) =>
  pipe(
    Effect.gen(function* () {
      const gh = yield* GitHubAPI;

      const [invalidRemoteIssues$, validRemoteIssues$_] = yield* pipe(
        gh.fetchCurrentIssues(),
        Stream.mapEffect((issue) =>
          pipe(
            Option.fromNullable(issue.body),
            Effect.andThen(getIssueData),
            Effect.either,
            Effect.map(
              Either.mapBoth({
                onLeft: () => ({ issue }),
                onRight: (issueData) => ({ issue, issueData }),
              }),
            ),
          ),
        ),
        Stream.partitionEither(Effect.succeed),
      );

      const [notTriggeredResults$, expiredResults$_] = yield* pipe(
        result$,
        Stream.partition(isExpiredResult),
      );

      const expiredResults$ = yield* Stream.broadcast(expiredResults$_, 2, 1);

      const validRemoteIssues$ = pipe(
        Effect.gen(function* () {
          const remoteIssuesByTodoUrl = yield* pipe(
            validRemoteIssues$_,
            Stream.runCollect,
            Effect.map((remoteIssues) =>
              HashMap.fromIterable(
                Chunk.toReadonlyArray(remoteIssues).map((issue) => [
                  issue.issueData.todoUrl,
                  issue,
                ]),
              ),
            ),
          );

          const [localOnlyIssues$, remoteMatchedIssues$] = yield* pipe(
            expiredResults$[0],
            Stream.partitionEither((result) =>
              pipe(
                HashMap.get(remoteIssuesByTodoUrl, result.url.toString()),
                Either.fromOption(() => ({ result })),
                Either.map(({ issue, issueData }) => ({
                  result,
                  issue,
                  issueData,
                })),
                Effect.succeed,
              ),
            ),
          );

          const orphanedIssues$ = pipe(
            expiredResults$[1],
            Stream.transduce(
              Sink.foldLeft(remoteIssuesByTodoUrl, (map, result) =>
                HashMap.remove(map, result.url.toString()),
              ),
            ),
            Stream.map(HashMap.values),
            Stream.flattenIterables,
          );

          return Stream.mergeWithTag(
            {
              LocalOnly: localOnlyIssues$,
              RemoteMatched: remoteMatchedIssues$,
              Orphaned: orphanedIssues$,
            },
            { concurrency: "unbounded" },
          );
        }),
        Stream.flatMap(identity),
      );

      return pipe(
        Stream.mergeWithTag(
          {
            Invalid: invalidRemoteIssues$,
            NotTriggered: Stream.map(notTriggeredResults$, (result) => ({
              result,
            })),
          },
          { concurrency: "unbounded" },
        ),
        Stream.merge(validRemoteIssues$),
      );
    }),
    Stream.flatMap(identity),
  );
