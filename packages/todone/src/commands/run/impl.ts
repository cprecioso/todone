import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { cliReporter } from "#/lib/reporters/cli";
import { RunCommand } from "./index";

export default async ({ onlyExpired, locale, unhandledUrls }: RunCommand) => {
  const config = await loadConfigFile();

  await run({
    ...config,
    plugins: [
      ...config.plugins,
      cliReporter({ onlyExpired, locale, unhandledUrls }),
    ],
  });
};
