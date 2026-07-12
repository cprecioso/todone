import type { ConfigInput } from "./lib/config/schema";

export type Config = ConfigInput;

export const defineConfig = (config: Config) => config;
