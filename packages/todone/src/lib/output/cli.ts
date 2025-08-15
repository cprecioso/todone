import chalk from "chalk";
import dedent from "dedent";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import { OutputMode } from "./base";

const dateFormatter = new Intl.DateTimeFormat();

export const makeOutputCli = (onlyExpired: boolean) =>
  Layer.effect(
    OutputMode,
    Effect.gen(function* () {
      const filesRef = yield* Ref.make(0);
      const matchesRef = yield* Ref.make(0);
      const resultsRef = yield* Ref.make(0);
      const expiredResultsRef = yield* Ref.make(0);

      const headerLn = (str = "") => Console.log(`${str}`);
      const infoLn = (str = "") => Console.log(`\t${str}`);

      return {
        start: Effect.void,

        fileItem: () => Ref.update(filesRef, (n) => n + 1),

        matchItem: () => Ref.update(matchesRef, (n) => n + 1),

        resultItem: ({ url, result, matches }) =>
          Effect.gen(function* () {
            yield* Ref.update(resultsRef, (n) => n + 1);

            if (onlyExpired && (!result || !result.isExpired)) return;

            for (const {
              file,
              position: { line, column },
            } of matches) {
              yield* headerLn(
                chalk.blueBright(file.location) +
                  ":" +
                  chalk.yellowBright(line) +
                  ":" +
                  chalk.yellowBright(column),
              );
              yield* infoLn(chalk.bold(url));

              if (!result) {
                yield* infoLn(chalk.gray("No plugin responded"));
              } else {
                const { isExpired, expirationDate } = result;

                yield* infoLn(
                  isExpired
                    ? chalk.bgYellow.redBright("EXPIRED")
                    : chalk.blue("Not expired yet"),
                );

                if (expirationDate) {
                  yield* infoLn(
                    [
                      isExpired ? "expired" : "will expire",
                      "on",
                      dateFormatter.format(expirationDate),
                    ].join(" "),
                  );
                }

                if (isExpired)
                  yield* Ref.update(expiredResultsRef, (n) => n + 1);
              }

              yield* headerLn();
            }
          }),

        end: Effect.gen(function* () {
          Console.log(dedent`
          Analysis complete:
          ${yield* filesRef.get} files found
          ${yield* matchesRef.get} matches found
          ${yield* resultsRef.get} results found
          ${yield* expiredResultsRef.get} expired results found
        `);
        }),
      };
    }),
  );
