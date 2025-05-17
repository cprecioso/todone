import { getReportsPromise, TodoneOptions } from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import { getFiles, GetFilesOptions } from "./helpers/get-files";

export { cli } from "./commands";

export interface Options extends TodoneOptions, Partial<GetFilesOptions> {}

export const run = async (
  globs: string[],
  { cwd = process.cwd(), gitignore = true, ...options }: Options,
) => {
  const files = getFiles(globs, { cwd, gitignore });
  return await getReportsPromise(files, {
    ...options,
    plugins: options.plugins || defaultPlugins,
  });
};
