import * as core from "@actions/core";
import { analyzeStream } from "@todone/core";
import * as s from "@todone/internal-util/stream";
import { createIssues, githubToken, globs, keyword } from "./input";
import { makeFileStream } from "./lib/files";
import { generateIssue } from "./lib/issues/generator";
import { reconcileIssues } from "./lib/issues/reconciler";
import { makeDebugLogger, makeResultLogger } from "./lib/logger";
import { makePlugins } from "./lib/make-plugins";
import { makeSummary } from "./lib/summary";
import { isExpiredResult, isResult } from "./lib/util";

const plugins = await makePlugins(githubToken);
const files = makeFileStream(globs);

const warnLogger = (line: string): void => core.warning(line);
const reportStream = analyzeStream(files, { plugins, warnLogger, keyword })
  .pipeThrough(s.tap(makeDebugLogger()))
  .pipeThrough(s.tap(makeResultLogger()));

const [streamForSummary, streamForIssues] = reportStream
  .pipeThrough(s.filter(isResult))
  .tee();

const summaryTask = Array.fromAsync(streamForSummary).then(makeSummary);

const issuesTask = !createIssues
  ? s.consume(streamForIssues)
  : Array.fromAsync(
      streamForIssues
        .pipeThrough(s.filter(isExpiredResult))
        .pipeThrough(s.map(generateIssue)),
    ).then(reconcileIssues);

await Promise.all([summaryTask, issuesTask]);
