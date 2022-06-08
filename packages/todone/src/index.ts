import runTodone from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import reporter from "@todone/reporter-cli";
import type { File } from "@todone/types";
import { src } from "vinyl-fs";

const todone = async (globs: string[]) => {
  await runTodone(
    () => src(globs) as AsyncIterable<File>,
    reporter,
    allPlugins.map((pluginFn) => pluginFn())
  );
};

export default todone;
