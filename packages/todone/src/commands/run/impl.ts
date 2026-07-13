import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { cliReporter } from "../../lib/reporters";
import { RunCommand } from "./index";

export default async ({ check, onlyExpired, locale }: RunCommand) => {
  const config = await loadConfigFile();

  if (check) {
    // Silent mode: strip the reporting hooks from every plugin, so the only
    // observable output is the exit code.
    const results = await run({
      ...config,
      plugins: config.plugins.map(
        ({ name, checkMatch, [Symbol.asyncDispose]: dispose }) => ({
          name,
          checkMatch,
          [Symbol.asyncDispose]: dispose,
        }),
      ),
    });
    return results.some((result) => result.result?.isExpired) ? 1 : 0;
  }

  await run({
    ...config,
    plugins: [...config.plugins, cliReporter({ onlyExpired, locale })],
  });
  return 0;
};
