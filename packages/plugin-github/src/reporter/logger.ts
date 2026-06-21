import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as t from "todone/types";
import { formatDate } from "./util/format";

/** Console logging of analyzed items, through the GitHub Actions toolkit. */

export const logFile = (file: t.File) =>
  Effect.sync(() => core.debug(`Found file: ${file.localPath}`));

export const logMatch = (match: t.Match) =>
  Effect.sync(() =>
    core.debug(
      `Found match: ${match.url} at ${match.file.localPath}:${match.position.line}:${match.position.column}`,
    ),
  );

export const logResult = ({ url, result, matches }: t.Result) =>
  Effect.sync(() => {
    const infoLines = Option.match(result, {
      onNone: () => ["No plugin responded"],
      onSome: ({ title, isExpired, expirationDate }) => [
        title || "No title",
        isExpired ? "Expired" : "Not expired",
        expirationDate ? formatDate(expirationDate) : "No expiration date",
      ],
    });

    const fileLines = matches.map(
      ({ file, position: { line, column } }) =>
        `${file.localPath}:${line}:${column}`,
    );

    core.info(
      `Found: ${url}\n` +
        [...infoLines, ...fileLines].map((line) => `\t${line}\n`).join(""),
    );
  });
