import { run } from "#/index";
import { cliReporterPlugin } from "#/lib/reporters/cli";
import { loadConfigFile } from "../../lib/config";
import { RunCommand } from "./index";

export default async ({ onlyExpired, locale, unhandledUrls }: RunCommand) => {
  const config = await loadConfigFile();

  await run({
    ...config,
    plugins: [
      ...config.plugins,
      cliReporterPlugin({ onlyExpired, locale, unhandledUrls }),
    ],
  });
};
