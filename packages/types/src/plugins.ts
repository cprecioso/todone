import type { Match } from "./objects";

export type Plugin = () => PluginInstance;

export interface PluginInstance {
  readonly name: string;
  checkExpiration(url: URL, match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expiration?: {
    date: Date;
    isApproximation: boolean;
  } | null;
}
