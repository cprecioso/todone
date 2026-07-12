import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { ConfigSchema } from "../../lib/config/schema";
import { RunCommand } from "./index";

export default async ({}: RunCommand) => {
  const rawConfig = await loadConfigFile();
  const config = ConfigSchema.parse(rawConfig);

  const results = await run(config);

  const exitCode = results.some((result) => result.result?.isExpired) ? 1 : 0;
  return exitCode;
};
