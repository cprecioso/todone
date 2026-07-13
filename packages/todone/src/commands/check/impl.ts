import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { silentReporter } from "#/lib/reporters";
import { CheckCommand } from "./index";

export default async ({}: CheckCommand) => {
  const config = await loadConfigFile();
  const results = await run(config, { forcedReporter: silentReporter() });
  return results.some((result) => result.result?.isExpired) ? 1 : 0;
};
