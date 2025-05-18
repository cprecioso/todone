import type { Match } from "./objects";

export type Searchable = RegExp | Pick<RegExp, "test">;
export type PatternProp = Searchable | Searchable[];

export interface PluginInstance {
  readonly name: string;
  readonly pattern?: PatternProp;
  check(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  isExpired: boolean;
  expirationDate?: Date;
}
