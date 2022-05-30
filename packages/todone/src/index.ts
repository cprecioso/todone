import runTodone from "@todone/core";
import GitHubIssuePlugin from "@todone/plugin-github";
import printer from "@todone/printer-cli";
import type { File } from "@todone/types";
import { src } from "vinyl-fs";

const todone = async (globs: string[]) => {
  await runTodone(() => src(globs) as AsyncIterable<File>, printer, [
    GitHubIssuePlugin(),
  ]);
};

export default todone;
