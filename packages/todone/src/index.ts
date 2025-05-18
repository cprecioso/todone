import { getReportsPromise, TodoneOptions } from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import {
  FactoriesToConfigObject,
  fromCode,
  InstancingOptions,
} from "@todone/plugin";
import { getFiles, GetFilesOptions } from "./helpers/get-files";

export interface Options extends TodoneOptions, Partial<GetFilesOptions> {}

export const run = async (
  globs: string[],
  { cwd = process.cwd(), gitignore = true, ...options }: Options,
) => {
  const files = getFiles(globs, { cwd, gitignore });
  return await getReportsPromise(files, options);
};

export const makeDefaultPlugins = (
  config: FactoriesToConfigObject<typeof defaultPlugins>,
  options?: InstancingOptions,
) => fromCode(defaultPlugins, config, options);
