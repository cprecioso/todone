import type { Match } from "./objects";

export interface PluginFactory {
  readonly displayName: string;
  (): Promise<PluginInstance>;
}

export interface PluginInstance {
  readonly displayName: string;
  checkExpiration(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expiration?: {
    date: Date;
    isApproximation: boolean;
  } | null;
}

export const definePlugin = (
  displayName: string,
  definition: () => Promise<Omit<PluginInstance, "displayName">>
): PluginFactory =>
  Object.assign(
    async () => Object.assign(await definition(), { displayName }),
    { displayName }
  );
