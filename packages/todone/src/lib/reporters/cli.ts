import { Reporter } from "#/plugin";
import chalk from "chalk";
import dedent from "dedent";

export interface CliReporterOptions {
  /** The locale to format dates with. Defaults to the system locale. */
  locale?: string;
  /** Only print expired results. */
  onlyExpired?: boolean;
}

export const cliReporter = ({
  locale,
  onlyExpired = false,
}: CliReporterOptions = {}): Reporter => {
  const dateFormatter = new Intl.DateTimeFormat(locale);

  let filesCounter = 0;
  let matchesCounter = 0;
  let resultsCounter = 0;
  let expiredResultsCounter = 0;

  const headerLn = (str = "") => console.log(`${str}`);
  const infoLn = (str = "") => console.log(`\t${str}`);

  return {
    info: async (message: string) => console.info(message),
    debug: async (message: string) => console.debug(message),

    reportFile: async () => {
      filesCounter++;
    },

    reportMatch: async () => {
      matchesCounter++;
    },

    reportResult: async ({
      url,
      result,
      match: {
        file,
        position: { line, column },
      },
    }) => {
      if (result === null) return;

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
