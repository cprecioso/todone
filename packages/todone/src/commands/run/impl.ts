import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { resolveConfig } from "#/lib/config/resolve";
import { RunCommand } from "./index";

export default async (_command: RunCommand) => {
  const rawConfig = await loadConfigFile();
  const config = resolveConfig(rawConfig);

  const results = await run(config);

  const exitCode = results.some((result) => result.result?.isExpired) ? 1 : 0;
  return exitCode;
};
