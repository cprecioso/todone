import type { ConfigInput } from "./lib/config/schema";

export type Config = Omit<ConfigInput, "$schema">;

export const defineConfig = (config: Config) => config;
