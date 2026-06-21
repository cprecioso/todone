import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { toHtml } from "hast-util-to-html";
import { h } from "hastscript";
import { CheckerResult } from "todone/plugin";
import { Match } from "todone/types";
import { ActionContext } from "../context";
import { filePermalink } from "../permalink";
import { formatDate } from "../util/format";

export type Column =
  | "file"
  | "url"
  | "expired"
  | "expirationDate"
  | "issue"
  | "action";

const COLUMN_LABELS: Record<Column, string> = {
  file: "File",
  url: "URL",
  expired: "Expired",
  expirationDate: "Expiration Date",
  issue: "Issue",
  action: "Action",
};

/**
 * A single summary row. Every field is optional, so each reporter contributes
 * as much or as little information as it has.
 */
export interface RowData {
  match?: Match;
  url?: string;
  result?: CheckerResult;
  issueNumber?: number;
  actionMessage?: string;
}

const link = (href: string, text: string) => toHtml(h("a", { href }, text));

const renderCell = (
  context: ActionContext,
  column: Column,
  row: RowData,
): string => {
  switch (column) {
    case "file": {
      if (!row.match) return "";
      const { file, position } = row.match;
      return Option.match(filePermalink(context, file, position.line), {
        onNone: () => file.localPath,
        onSome: (href) => link(href, file.localPath),
      });
    }

    case "url":
      return row.url ? link(row.url, row.url) : "";

    case "expired":
      return row.result ? (row.result.isExpired ? "❗" : "⌛") : "";

    case "expirationDate":
      return row.result
        ? row.result.expirationDate
          ? formatDate(row.result.expirationDate)
          : "No expiration date"
        : "";

    case "issue": {
      if (!row.issueNumber) return "";
      return Option.match(context.repo, {
        onNone: () => `#${row.issueNumber}`,
        onSome: ({ owner, repo }) =>
          link(
            `${context.serverUrl}/${owner}/${repo}/issues/${row.issueNumber}`,
            `#${row.issueNumber}`,
          ),
      });
    }

    case "action":
      return row.actionMessage ?? "";
  }
};

export interface SummaryInput {
  heading: string;
  columns: readonly Column[];
  rows: readonly RowData[];
}

/**
 * Writes a GitHub Actions job summary table, rendering only the requested
 * columns. Uses the Actions toolkit (`core.summary`).
 */
export const writeSummary = (
  context: ActionContext,
  input: SummaryInput,
): Effect.Effect<void, unknown> =>
  Effect.tryPromise(async () => {
    const header = input.columns.map((column) => ({
      data: COLUMN_LABELS[column],
      header: true,
    }));

    const body = input.rows.map((row) =>
      input.columns.map((column) => renderCell(context, column, row)),
    );

    await core.summary
      .addHeading(input.heading)
      .addTable([header, ...body])
      .write();
  });
