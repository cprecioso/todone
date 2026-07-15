import { run } from "#/index";
import { silentReporter } from "#/lib/reporters/silent";
import { loadConfigFile } from "../../lib/config";
import { cliReporterPlugin } from "../../lib/reporters/cli";
import { CheckCommand } from "./index";

export default async (_: CheckCommand) => {
  const config = await loadConfigFile();
  const results = await run(
    { ...config, plugins: [cliReporterPlugin(), ...config.plugins] },
    { forcedReporter: silentReporter() },
  );
  return results.some((result) => result.result?.isExpired) ? 1 : 0;
};
