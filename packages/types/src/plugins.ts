import type { Match } from "./objects";

export interface PluginFactory {
  (): Promise<PluginInstance>;
}

export interface PluginInstance {
  readonly name: string;
  checkExpiration(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expiration?: {
    date: Date;
    isApproximation: boolean;
  } | null;
}
