import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { Octokit } from "octokit";
import * as pkg from "../package.json" with { type: "json" };

export class GitHub extends Effect.Service<GitHub>()(`${pkg.name}/GitHub`, {
  effect: Effect.gen(function* () {
    const token = yield* Config.withDefault(
      Config.redacted(Config.string("GITHUB_TOKEN")),
      undefined,
    );
    const client = new Octokit({ auth: token && Redacted.value(token) });
    return { client };
  }),
}) {}
