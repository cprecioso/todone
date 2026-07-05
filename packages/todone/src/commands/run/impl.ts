import { run } from "#/index";
import { hydrateConfig } from "#/lib/config/hydrate";
import { loadConfigFile } from "#/lib/config/load";
import { RunCommand } from "./index";

export default async ({ reporter: overrideReporter }: RunCommand) => {
  const rawConfig = await loadConfigFile();
  const rawConfigWithOverrides = {
    ...rawConfig,
    reporter: overrideReporter ?? rawConfig.reporter,
  };
  const config = await hydrateConfig(rawConfigWithOverrides);

  const results = await run(config);

  const exitCode = results.some((result) => result.result?.isExpired) ? 1 : 0;
  return exitCode;
};
