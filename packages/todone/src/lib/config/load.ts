import { loadConfig } from "c12";

export const loadConfigFile = async (path?: string) => {
  const { config } = await loadConfig({
    name: "todone",
    rcFile: false,
    cwd: path,
  });
  return config;
};
