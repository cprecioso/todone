import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { jsonReporter } from "../../lib/reporters";
import { JsonCommand } from "./index";

export default async ({}: JsonCommand) => {
  const config = await loadConfigFile();
  await run(config, { forcedReporter: jsonReporter() });
  return 0;
};
