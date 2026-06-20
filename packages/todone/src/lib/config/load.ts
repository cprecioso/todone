import { loadConfig } from "c12";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { Config } from "./schema";

export const ConfigFile = Schema.parseJson(Config);

export const loadConfigFile = (path?: string) =>
  Effect.tryPromise({
    try: async () => {
      const { config } = await loadConfig({
        name: "todone",
        rcFile: false,
        cwd: path,
      });
      return config;
    },
    catch: (error) => new Error(`Failed to load config file`, { cause: error }),
  });
