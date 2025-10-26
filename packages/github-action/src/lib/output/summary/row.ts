import { SummaryTableRow } from "@actions/core/lib/summary";
import * as t from "@todone/types";
import { Match } from "@todone/types";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { toHtml } from "hast-util-to-html";
import { h } from "hastscript";
import { repo, server } from "../../../input";
import { GitHubFile } from "../../files";
import { formatDate } from "../../util/format";

export type RowInput = {
  url?: string;
  match?: Match<GitHubFile.E, GitHubFile.R, GitHubFile>;
  result?: t.PluginResult | null;
  issueNumber?: number;
  actionMessage?: string;
};

export type Row = SummaryTableRow &
  [
    file: string,
    url: string,
    expired: string,
    expirationDate: string,
    issueNumber: string,
    actionMessage: string,
  ];

export const SUMMARY_TABLE_HEADER: SummaryTableRow = (
  ["File", "URL", "Expired", "Expiration Date", "Issue", "Action"] satisfies Row
).map((data) => ({ data, header: true }));

export const generateRow = ({
  url,
  match,
  result,
  actionMessage,
  issueNumber,
}: RowInput) =>
  Effect.gen(function* () {
    let location = "";

    if (match) {
      const fileUrl = Option.getOrUndefined(
        yield* match.file.getUrl(match.position.line),
      )?.toString();
      if (fileUrl) {
        location = toHtml(h("a", { href: fileUrl }, match.file.location));
      } else {
        location = match.file.location;
      }
    }

    const urlString = url ? toHtml(h("a", { href: url }, url)) : "";

    const issueNumberStr = issueNumber
      ? toHtml(
          h(
            "a",
            {
              href: `${server}/${repo.owner}/${repo.repo}/issues/${issueNumber}`,
            },
            `#${issueNumber}`,
          ),
        )
      : "";

    return [
      location,
      urlString,
      result ? (result.isExpired ? "❗" : "⌛") : "",
      result
        ? result.expirationDate
          ? formatDate(result.expirationDate)
          : "No expiration date"
        : "",
      issueNumberStr,
      actionMessage || "",
    ] as Row;
  });
