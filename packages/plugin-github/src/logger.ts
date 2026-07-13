import * as pkg from "#/package.json" with { type: "json" };
import * as core from "@actions/core";
import { Plugin } from "todone/plugin";
import * as t from "todone/types";
import { GithubPluginOptions } from "./options";
import { formatDate } from "./reporter/util/format";

export const makeLoggerPlugin = (
  options: GithubPluginOptions,
): Plugin | false =>
  options.actions.logger && {
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

    async reportFile(file) {
      core.debug(`Found file: ${file.localPath}`);
    },

    async reportMatch(match: t.Match) {
      core.debug(
        `Found match: ${match.url} at ${match.file.localPath}:${match.position.line}:${match.position.column}`,
      );
    },

    async reportResult({ result, match, match: { url } }: t.Result) {
      const infoLines = result
        ? [
            result.title || "No title",
            result.isExpired ? "Expired" : "Not expired",
            result.expirationDate
              ? formatDate(result.expirationDate)
              : "No expiration date",
          ]
        : ["No plugin responded"];

      const {
        file,
        position: { line, column },
      } = match;
      const fileLine = `${file.localPath}:${line}:${column}`;

      core.info(
        `Found: ${url}\n` +
          [...infoLines, fileLine].map((line) => `\t${line}\n`).join(""),
      );
    },
  };
