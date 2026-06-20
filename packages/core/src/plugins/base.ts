import * as Data from "effect/Data";

export class PluginFailedError extends Data.Error<{
  pluginName: string;
  url: string;
  cause?: unknown;
}> {}
