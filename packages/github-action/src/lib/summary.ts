import { SummaryTableRow } from "@actions/core/lib/summary";
import * as t from "@todone/types";
import { Match } from "@todone/types";
import { toHtml } from "hast-util-to-html";
import { h } from "hastscript";
import { repo, server } from "../input";
import { GitHubFile } from "./files";
import { IssueAction } from "./issues/reconciler";
import { formatDate } from "./util";

export type RowInput = {
  url: string;
  match?: Match<GitHubFile>;
  result?: t.PluginResult | null;
  issueNumber?: number;
  action?: IssueAction;
};

type Row = [
  file: string,
  url: string,
  expired: string,
  expirationDate: string,
  issueNumber: string,
  action: string,
];
const HEADER: Row = [
  "File",
  "URL",
  "Expired",
  "Expiration Date",
  "Issue",
  "Action",
];

const actionToString: Record<IssueAction, string> = {
  [IssueAction.Create]: "Created",
  [IssueAction.Update]: "Updated",
  [IssueAction.CloseCompleted]: "Closed (completed)",
  [IssueAction.CloseInvalid]: "Closed (invalid)",
};

export class SummaryTable {
  readonly #rows: Promise<Row>[] = [];

  async #createRow({ url, match, result, action, issueNumber }: RowInput) {
    let location = "";

    if (match) {
      const fileUrl = await match.file.getUrl(match.position.line);
      if (fileUrl) {
        location = toHtml(h("a", { href: fileUrl }, match.file.location));
      } else {
        location = match.file.location;
      }
    }

    let urlString = toHtml(h("a", { href: url }, url));

    let issueNumberStr = issueNumber
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
      action ? actionToString[action] : "",
    ] as Row;
  }

  addRow(params: RowInput) {
    this.#rows.push(this.#createRow(params));
  }

  async getTable(): Promise<SummaryTableRow[]> {
    return [
      HEADER.map((data) => ({ data, header: true })),
      ...(await Promise.all(this.#rows)),
    ];
  }
}
