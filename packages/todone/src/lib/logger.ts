import type { Plugin } from "#/plugin";

export const cliLogger = (): Plugin => ({
  name: "todone:logger-cli",
  warn: async (message: string) => console.warn(message),
  info: async (message: string) => console.info(message),
  debug: async (message: string) => console.debug(message),
});
