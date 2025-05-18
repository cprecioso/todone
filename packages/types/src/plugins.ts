import type { Match } from "./objects";

export type Searchable = RegExp | { test(string: string): boolean };
export type PatternProp = Searchable | Searchable[];

export interface PluginFactory {
  readonly name: string;
  readonly displayName?: string;
  readonly pattern?: PatternProp;
  make(): Promise<PluginInstance>;
}

export interface PluginInstance {
  readonly pattern?: PatternProp;
  check(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expirationDate?: Date;
}

export const definePlugin = (factory: PluginFactory | PluginFactory[]) =>
  Array.isArray(factory) ? factory : [factory];
