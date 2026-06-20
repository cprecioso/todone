export interface PluginBase {
  /** The plugin's id, will be used for selecting and reporting */
  readonly id: string;

  /** The plugin's name, will be used for reporting */
  readonly name: string;
}
