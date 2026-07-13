import { loadConfig } from "c12";
import { ConfigSchema } from "./schema";

export const loadConfigFile = async (path?: string) => {
  const { config } = await loadConfig({
    name: "todone",
    rcFile: false,
    cwd: path,
  });
  return ConfigSchema.parse(config);
};
