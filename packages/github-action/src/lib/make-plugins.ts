import * as core from "@actions/core";
import defaultPlugins from "@todone/default-plugins";
import { pluginsFromEnv } from "@todone/plugin";

export const makePlugins = async (token: string) => {
  const plugins = await pluginsFromEnv(
    defaultPlugins,
    {
      GITHUB_TOKEN: token,
      ...process.env,
    },
    {
      onConfigError: (pluginName, error) =>
        core.warning(
          new Error("Error while configuring plugin " + pluginName, {
            cause: error,
          }),
        ),
      onInstancingError: (pluginName, error) =>
        core.warning(
          new Error("Error while instancing plugin " + pluginName, {
            cause: error,
          }),
        ),
    },
  );

  core.notice("Instanced plugins: " + plugins.map((p) => p.name).join(", "));

  return plugins;
};
