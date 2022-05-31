import type { Match } from "./objects";

export interface PluginContext {
  match: Match;
}

export interface PluginInstance {
  readonly name: string;
  checkExpiration(url: URL, ctx: PluginContext): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expiration?: {
    date: Date;
    isApproximation: boolean;
  } | null;
}
