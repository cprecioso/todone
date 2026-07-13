import * as pkg from "#/package.json" with { type: "json" };
import * as core from "@actions/core";
import { Plugin } from "todone/plugin";
import * as t from "todone/types";
import { formatDate } from "./reporter/util/format";

export const makeLoggerPlugin = (): Plugin => ({
  name: `${pkg.name}:logger`,

  async warn(message) {
    core.warning(message);
  },
  async info(message) {
    core.info(message);
  },
  async debug(message) {
    core.debug(message);
  },

  async makeReporter() {
    return {
      async file(file) {
        core.debug(`Found file: ${file.localPath}`);
      },

      async match(match: t.Match) {
        core.debug(
          `Found match: ${match.url} at ${match.file.localPath}:${match.position.line}:${match.position.column}`,
        );
      },

      async result({ result, matches, url }: t.Result) {
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
            `${file.localPath}:${line}:${column}`,
        );

        core.info(
          `Found: ${url}\n` +
            [...infoLines, ...fileLines].map((line) => `\t${line}\n`).join(""),
        );
      },

      async end(error) {
        if (error) core.error(String(error));
      },
    };
  },
});
