import * as t from "@todone/types";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };
import { Console } from "../../services/console";
import { GitHubFile } from "../files";
import { formatDate } from "../util/format";
import { Result } from "../util/result";

export class AnalysisLogger extends Effect.Service<AnalysisLogger>()(
  `${pkg.name}/ItemConsoleLogger`,
  {
    accessors: true,
    dependencies: [Console.Default],
    effect: Effect.gen(function* () {
      const logger = yield* Console;

      const debugItem = (item: unknown) =>
        logger.debug("Found: " + JSON.stringify(item, null, 2));

      return {
        logFile: (item: GitHubFile) => debugItem(item),
        logMatch: (item: t.Match<GitHubFile.E, GitHubFile.R, GitHubFile>) =>
          debugItem(item),
        logResult: (item: Result) =>
          Effect.gen(function* () {
            yield* debugItem(item);

            const { result, matches, url } = item;

            const infoLines = result
              ? [
                  result.title || "No title",
                  result.isExpired ? "Expired" : "Not expired",
                  result.expirationDate
                    ? formatDate(result.expirationDate)
                    : "No expiration date",
                ]
              : ["No plugin responded"];

            const fileLines = matches.map(
              ({ file, position: { line, column } }) =>
                `${file.location}:${line}:${column}`,
            );

            yield* logger.info(
              `Found: ${url}\n` +
                [...infoLines, ...fileLines]
                  .map((line) => `\t${line}\n`)
                  .reduce((acc, item) => acc + item, ""),
            );
          }),
      };
    }),
  },
) {}
