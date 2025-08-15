import { PluginResult } from "@todone/types";
import { UnknownException } from "effect/Cause";
import * as Effect from "effect/Effect";
import { GitHub } from "./common";

const maybeDate = (date: string | null): Date | undefined =>
  (date && new Date(date)) || undefined;

export const resourceFetchers = {
  issues: (repo, issue_number) =>
    Effect.gen(function* () {
      const { client } = yield* GitHub;
      const { data } = yield* Effect.tryPromise(() =>
        client.rest.issues.get({ ...repo, issue_number }),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    }),

  pull: (repo, pull_number) =>
    Effect.gen(function* () {
      const { client } = yield* GitHub;
      const { data } = yield* Effect.tryPromise(() =>
        client.rest.pulls.get({ ...repo, pull_number }),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    }),

  milestone: (repo, milestone_number) =>
    Effect.gen(function* () {
      const { client } = yield* GitHub;
      const { data } = yield* Effect.tryPromise(() =>
        client.rest.issues.getMilestone({ ...repo, milestone_number }),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at) || maybeDate(data.due_on),
      };
    }),
} as const satisfies Record<
  string,
  (
    repo: { owner: string; repo: string },
    number: number,
  ) => Effect.Effect<PluginResult, UnknownException, GitHub>
>;
