import { Reporter } from "#/plugin";
import chalk from "chalk";
import dedent from "dedent";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";

export const cliReporter = Effect.gen(function* () {
  const locale = yield* Config.withDefault(
    Config.string("reporter.cli.locale"),
    undefined,
  );

  const onlyExpired = yield* Config.withDefault(
    Config.boolean("reporter.cli.onlyExpired"),
    false,
  );

  const dateFormatter = new Intl.DateTimeFormat(locale);

  const filesRef = yield* Ref.make(0);
  const matchesRef = yield* Ref.make(0);
  const resultsRef = yield* Ref.make(0);
  const expiredResultsRef = yield* Ref.make(0);
  const finalizerRegistered = yield* Ref.make(false);

  const headerLn = (str = "") => Console.log(`${str}`);
  const infoLn = (str = "") => Console.log(`\t${str}`);

  const printSummary = Effect.gen(function* () {
    yield* Console.log(dedent`
      Analysis complete:
      ${yield* filesRef.get} files found
      ${yield* matchesRef.get} matches found
      ${yield* resultsRef.get} results found
      ${yield* expiredResultsRef.get} expired results found
    `);
  });

  // Registered from the first report call (not the factory body) so it binds to
  // the run scope and fires at end of run, after all items are counted.
  const registerFinalizer = Effect.gen(function* () {
    const already = yield* Ref.getAndSet(finalizerRegistered, true);
    if (already) return;
    yield* Effect.addFinalizer(() => printSummary);
  });

  const plugin: Reporter = {
    id: "cli",
    name: "Command Line Interface Reporter",

    info: (message: string) => Console.info(message),
    debug: (message: string) => Console.debug(message),

    reportFile: () =>
      Effect.zipRight(
        registerFinalizer,
        Ref.update(filesRef, (n) => n + 1),
      ),

    reportMatch: () => Ref.update(matchesRef, (n) => n + 1),

    reportResult: ({ url, result, matches }) =>
      Effect.gen(function* () {
        yield* Ref.update(resultsRef, (n) => n + 1);

        if (onlyExpired) {
          const isExpired = Option.match(result, {
            onSome: (result) => result.isExpired,
            onNone: () => false,
          });
          if (!isExpired) return;
        }

        for (const {
          file,
          position: { line, column },
        } of matches) {
          yield* headerLn(
            chalk.blueBright(file.localPath) +
              ":" +
              chalk.yellowBright(line) +
              ":" +
              chalk.yellowBright(column),
          );
          yield* infoLn(chalk.bold(url));

          yield* Option.match(result, {
            onNone: () => infoLn(chalk.gray("No plugin responded")),
            onSome: ({ isExpired, expirationDate }) =>
              Effect.gen(function* () {
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
              }),
          });

          yield* headerLn();
        }
      }),
  };

  return plugin;
});
