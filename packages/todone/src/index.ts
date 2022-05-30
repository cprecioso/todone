import runTodone from "@todone/core";
import GitHubIssuePlugin from "@todone/plugin-github";
import reporter from "@todone/reporter-cli";
import type { File } from "@todone/types";
import { src } from "vinyl-fs";

const todone = async (globs: string[]) => {
  await runTodone(() => src(globs) as AsyncIterable<File>, reporter, [
    GitHubIssuePlugin(),
  ]);
};

export default todone;
