import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { CheckCommand } from "./index";

export default async ({}: CheckCommand) => {
  const config = await loadConfigFile();

  const results = await run(config, {
    forcedReporter: { name: "todone:reporter-silent" },
  });

  return results.some((result) => result.result?.isExpired) ? 1 : 0;
};
