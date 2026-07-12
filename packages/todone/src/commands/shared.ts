import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import type { Plugin } from "#/plugin";
import { ConfigSchema } from "../lib/config/schema";

/** Load the config, run todone with the given reporter plugin, and return the exit code. */
export const execute = async (reporter: Plugin): Promise<number> => {
  const rawConfig = await loadConfigFile();
  const config = ConfigSchema.parse(rawConfig);

  const results = await run({
    ...config,
    plugins: [...config.plugins, reporter],
  });

  return results.some((result) => result.result?.isExpired) ? 1 : 0;
};
