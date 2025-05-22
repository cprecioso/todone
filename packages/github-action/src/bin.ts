import * as core from "@actions/core";
import * as glob from "@actions/glob";
import * as todone from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import * as s from "@todone/internal-util/stream";
import { fromEnv } from "@todone/plugin";
import * as t from "@todone/types";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

const config = {
  globs: core.getInput("globs", { required: true }),
  keyword: core.getInput("keyword", { required: false }),
};

const globber = await glob.create(config.globs, { matchDirectories: false });
const files = Readable.toWeb(
  Readable.from(globber.globGenerator()),
).pipeThrough(
  s.map(
    (file): t.File => ({
      url: pathToFileURL(file),
      isPresent: true,
      getContent: () => Readable.toWeb(createReadStream(file)),
    }),
  ),
);

const reports = todone.getReportStream(files, {
  keyword: config.keyword,
  plugins: await fromEnv(defaultPlugins, process.env, {
    onConfigError(name, error) {
      core.warning(`Plugin ${name} config error: ${error}`);
    },
    onInstancingError(name, error) {
      core.warning(`Plugin ${name} instancing error: ${error}`);
    },
  }),
});

let table: t.ReportResult[] = [];

for await (const report of reports) {
  switch (report.type) {
    case "file":
      core.info(`File: ${report.item.url}`);
      break;
    case "match":
      core.info(
        `Match ${report.item.file.url}:${report.item.start.line}:${report.item.start.column}\n\t${report.item.url}`,
      );
      break;
    case "result":
      core.info(
        `Match ${report.item.match.file.url}:${report.item.match.start.line}:${report.item.match.start.column}\n\t${report.item.url}\n\t${report.item.result?.isExpired ? "Expired" : "Not expired"}`,
      );
      table.push(report.item);
      break;
  }
}

let summary = core.summary.addHeading("Todone Report", 2);
if (table.length === 0) {
  summary = summary.addRaw("✅ No matches found", true);
} else {
  summary = summary.addTable([
    ["File", "Line", "Column", "URL", "Expired"].map((txt) => ({
      header: true,
      data: txt,
    })),
    ...table.map((result) => {
      return [
        result.match.file.url,
        String(result.match.start.line),
        String(result.match.start.column),
        result.url,
        result.result?.isExpired ? "✅" : "❌",
      ];
    }),
  ]);
}
