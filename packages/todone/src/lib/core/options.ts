import { Plugin } from "../plugins";

export interface Options {
  /**
   * Keyword to match against
   *
   * @default "@TODO"
   */
  readonly keyword: string;

  /**
   * Plugins that matches will be run through
   */
  plugins: readonly Plugin[];
}
