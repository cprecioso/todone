import * as core from "@actions/core";
import { analyzeStream } from "@todone/core";
import * as s from "@todone/internal-util/stream";
import {
  generateIssue,
  isExpiredResult,
  makeIssueReconciler,
} from "./lib/create-issues";
import { makeFileStream } from "./lib/files";
import { makeDebugLogger, makeResultLogger } from "./lib/logger";
import { makePlugins } from "./lib/make-plugins";
import { makeSummary } from "./lib/summary";

const githubToken = core.getInput("github-token", { required: true });
const globs = core.getInput("globs", { required: true });
const createIssues = core.getBooleanInput("create-issues");
const keyword = core.getInput("keyword", { required: true });

const warnLogger = (line: string): void => core.warning(line);

const plugins = await makePlugins(githubToken);
const files = makeFileStream(globs);

const reportStream = analyzeStream(files, { plugins, warnLogger, keyword })
  .pipeThrough(s.tap(makeDebugLogger()))
  .pipeThrough(s.tap(makeResultLogger()));

const [streamForSummary, streamForIssues] = reportStream.tee();

const summaryTask = s.toArray(streamForSummary).then(makeSummary);
const issuesTask = s
  .toArray(
    streamForIssues
      .pipeThrough(s.filter(isExpiredResult))
      .pipeThrough(s.map(generateIssue)),
  )
  .then(makeIssueReconciler(createIssues, githubToken));

await Promise.all([summaryTask, issuesTask]);
