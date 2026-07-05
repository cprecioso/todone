import { Factory, Reporter } from "#/plugin";
import chalk from "chalk";
import dedent from "dedent";
import * as z from "zod";
import { BUILTIN_PLUGIN_ID } from "./base";

export const CliReporterConfig = z.object({
  locale: z.string().optional(),
  onlyExpired: z.boolean().optional().default(false),
});

export const cliReporter = (rawOptions: unknown): Factory<Reporter> => {
  const { locale, onlyExpired } = CliReporterConfig.parse(rawOptions);

  return {
    id: `${BUILTIN_PLUGIN_ID}/cli`,
    make: async () => {
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
          resultsCounter++;

          if (result?.isExpired) expiredResultsCounter++;
          else if (onlyExpired) return;

          headerLn(
            chalk.blueBright(file.localPath) +
              ":" +
              chalk.yellowBright(line) +
              ":" +
              chalk.yellowBright(column),
          );

          infoLn(chalk.bold(url));

          if (result === null) {
            infoLn(chalk.gray("No plugin responded"));
          } else {
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
    },
  };
};
