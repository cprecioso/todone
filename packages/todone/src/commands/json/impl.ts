import { run } from "#/index";
import { loadConfigFile } from "#/lib/config/load";
import { jsonReporter } from "../../lib/reporters";
import { JsonCommand } from "./index";

export default async ({}: JsonCommand) => {
  const config = await loadConfigFile();

  // Strip the reporting hooks from every configured plugin so stdout carries
  // nothing but this command's NDJSON.
  await run({
    ...config,
    plugins: [
      ...config.plugins.map(
        ({ name, checkMatch, [Symbol.asyncDispose]: dispose }) => ({
          name,
          checkMatch,
          [Symbol.asyncDispose]: dispose,
        }),
      ),
      jsonReporter(),
    ],
  });
  return 0;
};
