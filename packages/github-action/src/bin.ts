import * as core from "@actions/core";
import { analyzeStream } from "@todone/core";
import * as s from "@todone/internal-util/stream";
import { githubToken, globs, keyword } from "./input";
import { makeFileStream } from "./lib/files";
import * as gh from "./lib/issues/actions";
import { generateIssue } from "./lib/issues/generator";
import { IssueAction, Reconciler } from "./lib/issues/reconciler";
import { makeDebugLogger, makeResultLogger } from "./lib/logger";
import { makePlugins } from "./lib/plugins";
import { SummaryTable } from "./lib/summary";
import { isExpiredResult, isResult } from "./lib/util";

const plugins = await makePlugins(githubToken);
const files = makeFileStream(globs);

const warnLogger = (line: string): void => core.warning(line);

const analysis$ = analyzeStream(files, { plugins, warnLogger, keyword })
  .pipeThrough(s.tap(makeDebugLogger()))
  .pipeThrough(s.tap(makeResultLogger()))
  .pipeThrough(s.filter(isResult));

const summaryTable = new SummaryTable();

const { valid, invalid } = await gh.fetchCurrentIssues();

for (const { issue } of invalid) {
  await gh.closeInvalid(issue.number);
}

const reconciler = new Reconciler(valid);

for await (const item of analysis$) {
  if (isExpiredResult(item)) {
    const issueDefinition = await generateIssue(item);
    const patch = reconciler.reconcileResult(item.result);

    switch (patch.action) {
      case IssueAction.Create: {
        const newIssueNumber = await gh.createIssue(issueDefinition);
        for (const match of item.result.matches) {
          summaryTable.addRow({
            url: item.result.url.toString(),
            match,
            result: item.result.result,
            issueNumber: newIssueNumber,
            action: IssueAction.Create,
          });
        }
        break;
      }

      case IssueAction.Update: {
        const updatedIssueNumber = await gh.updateIssue(
          patch.number,
          issueDefinition,
        );
        for (const match of item.result.matches) {
          summaryTable.addRow({
            url: item.result.url.toString(),
            match,
            result: item.result.result,
            issueNumber: updatedIssueNumber,
            action: IssueAction.Update,
          });
        }
        break;
      }

      default: {
        patch satisfies never;
      }
    }
  } else {
    for (const match of item.result.matches) {
      summaryTable.addRow({
        url: item.result.url.toString(),
        match,
        result: item.result.result,
      });
    }
  }
}

for (const issue of reconciler.getOrphanedIssues()) {
  await gh.closeCompleted(issue.number);
  summaryTable.addRow({
    url: issue.url,
    action: IssueAction.CloseCompleted,
    issueNumber: issue.number,
  });
}

await core.summary
  .addHeading("TODOs found")
  .addTable(await summaryTable.getTable())
  .write();
