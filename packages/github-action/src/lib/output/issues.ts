import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { identity, pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { GitHubAPI } from "../issues/actions";
import { generateIssue } from "../issues/generator";
import { IssueSyncStatus } from "../issues/reconciler";

const IssueSyncActions = pipe(
  GitHubAPI,
  Effect.andThen((gh) =>
    IssueSyncStatus.$match({
      Invalid: ({ value: { issue } }) => gh.closeInvalid(issue.number),
      LocalOnly: ({ value: { result } }) =>
        Effect.andThen(generateIssue(result), gh.createIssue),
      NotTriggered: () => Effect.void,
      Orphaned: ({ value: { issue } }) => gh.closeCompleted(issue.number),
      RemoteMatched: ({ value: { result, issue } }) =>
        Effect.andThen(generateIssue(result), gh.updateIssue(issue.number)),
    }),
  ),
);

export type IssueSyncResult = Stream.Stream.Success<
  ReturnType<typeof syncChanges>
>;

export const IssueSyncResult = Data.taggedEnum<IssueSyncResult>();

export const syncChanges = <E, R>(
  results: Stream.Stream<IssueSyncStatus, E, R>,
) =>
  pipe(
    IssueSyncActions,
    Effect.andThen((performSync) =>
      Stream.mapEffect(results, <T extends IssueSyncStatus>(result: T) =>
        Effect.map(performSync(result), (syncResult) => ({
          ...result,
          value: { ...result.value, syncResult },
        })),
      ),
    ),
    Stream.flatMap(identity),
  );
