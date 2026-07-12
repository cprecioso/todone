import type { Reporter } from "../plugins";
import { autoReporter } from "../reporters";
import { Config } from "./schema";

export type ResolvedConfig = Omit<Config, "reporter"> & { reporter: Reporter };

export const resolveConfig = (rawConfig: unknown): ResolvedConfig => {
  const config = Config.parse(rawConfig);
  return { ...config, reporter: config.reporter ?? autoReporter() };
};
