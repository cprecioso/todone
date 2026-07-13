import type { Plugin } from "#/plugin";
import type * as t from "#/types";
import chalk from "chalk";
import dedent from "dedent";

export type UnhandledUrls = "ignore" | "warn" | "error";

class UnhandledUrlError extends Error {
  constructor(match: t.Match) {
    const {
      url,
      file,
      position: { line, column },
    } = match;
    super(
      `No plugin returned a result for ${url} (${file.localPath}:${line}:${column}). ` +
        `Add a plugin that handles this URL, or pass \`--unhandled-urls warn\` or \`--unhandled-urls ignore\`.`,
    );
  }
}

export interface CliReporterOptions {
  /** The locale to format dates with. Defaults to the system locale. */
  locale?: string;
  /** Only print expired results. */
  onlyExpired?: boolean;
  /** What to do when no plugin returns a result for a URL. */
  unhandledUrls?: UnhandledUrls;
}

export const cliReporter = ({
  locale,
  onlyExpired = false,
  unhandledUrls = "error",
}: CliReporterOptions = {}): Plugin => {
  const dateFormatter = new Intl.DateTimeFormat(locale);

  let filesCounter = 0;
  let matchesCounter = 0;
  let resultsCounter = 0;
  let expiredResultsCounter = 0;

  const headerLn = (str = "") => console.log(`${str}`);
  const infoLn = (str = "") => console.log(`\t${str}`);

  return {
    name: "todone:reporter-cli",

    warn: async (message: string) => console.warn(message),
    info: async (message: string) => console.info(message),
    debug: async (message: string) => console.debug(message),

    reportFile: async () => {
      filesCounter++;
    },

    reportMatch: async () => {
      matchesCounter++;
    },

    reportResult: async ({ result, match, match: { url } }) => {
      const {
        file,
        position: { line, column },
      } = match;

      if (result === null) {
        switch (unhandledUrls) {
          case "error":
            throw new UnhandledUrlError(match);
          case "warn":
            console.warn(
              `no plugin handled ${url} (${file.localPath}:${line}:${column})`,
            );
          // fallthrough
          case "ignore":
            return;
          default:
            return unhandledUrls satisfies never;
        }
      }

      resultsCounter++;

      if (result.isExpired) expiredResultsCounter++;
      else if (onlyExpired) return;

      headerLn(
        chalk.blueBright(file.localPath) +
          ":" +
          chalk.yellowBright(line) +
          ":" +
          chalk.yellowBright(column),
      );

      infoLn(chalk.bold(url));

      const { isExpired, expirationDate } = result;

      infoLn(
        isExpired
          ? chalk.bgYellow.redBright("EXPIRED")
          : chalk.blue("Not expired yet"),
      );

      if (expirationDate) {
        infoLn(
          [
            isExpired ? "expired" : "will expire",
            "on",
            dateFormatter.format(expirationDate),
          ].join(" "),
        );
      }

      headerLn();
    },

    async [Symbol.asyncDispose]() {
      console.log(dedent`
        Analysis complete:
          ${filesCounter} files found
          ${matchesCounter} matches found
          ${resultsCounter} results found
          ${expiredResultsCounter} expired results found
      `);
    },
  };
};
