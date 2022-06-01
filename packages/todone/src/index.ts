import runTodone from "@todone/core";
import CaniusePlugin from "@todone/plugin-caniuse";
import DatePlugin from "@todone/plugin-date";
import FigmaCommentPlugin from "@todone/plugin-figma";
import GitHubIssuePlugin from "@todone/plugin-github";
import reporter from "@todone/reporter-cli";
import type { File } from "@todone/types";
import { src } from "vinyl-fs";

const todone = async (globs: string[]) => {
  await runTodone(() => src(globs) as AsyncIterable<File>, reporter, [
    DatePlugin(),
    CaniusePlugin(),
    GitHubIssuePlugin(),
    FigmaCommentPlugin(),
  ]);
};

export default todone;
