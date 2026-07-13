import type * as t from "#/types";

export interface PluginContext {
  warn(this: void, message: string): void;
  info(this: void, message: string): void;
  debug(this: void, message: string): void;
}

export type PluginOption = Plugin | readonly PluginOption[];

/**
 * A todone plugin. All hooks are optional: a plugin can check TODO URLs
 * ({@link Plugin.checkMatch}), report progress and results (`report*`,
 * `warn`/`info`/`debug`), clean up when the run finishes
 * (`Symbol.asyncDispose`), or any combination of them.
 *
 * For example, a GitHub plugin might check if a URL points to a GitHub issue
 * or PR, and if so, whether that issue or PR is still open.
 */
export interface Plugin {
  /**
   * A human-readable name for the plugin, used in error messages. Usually the
   * package name.
   */
  name: string;

  warn?(this: PluginContext, message: string): void;
  info?(this: PluginContext, message: string): void;
  debug?(this: PluginContext, message: string): void;

  /**
   * Check whether a URL should be considered as expired or not.
   *
   * Return `null` if this plugin doesn't handle the URL; throw only for real
   * failures (network errors, missing credentials, malformed data).
   */
  checkMatch?(
    this: PluginContext,
    options: { url: URL },
  ): Promise<CheckerResult | null>;

  reportFile?(this: PluginContext, item: t.File): Promise<void>;
  reportMatch?(this: PluginContext, item: t.Match): Promise<void>;
  reportResult?(this: PluginContext, item: t.Result): Promise<void>;
  reportEnd?(this: PluginContext, error?: unknown): Promise<void>;
}

/**
 * The result of running a {@link Plugin}'s check against a URL, indicating whether the
 * TODO is expired or not, and some metadata about the check.
 */
export interface CheckerResult {
  /**
   * A human title for the reference URL
   *
   * For example, for a GitHub issue URL, this might be the issue title.
   */
  title: string;

  /**
   * Whether this TODO has expired and needs action
   *
   * This has different meanings depending on the plugin. For example, for a
   * GitHub issue, it might mean the issue is marked as closed. For a calendar
   * event, it might mean the event date has passed.
   */
  isExpired: boolean;

  /**
   * If known, when this TODO expired or will expire. It's fine to leave this
   * empty if not known for sure.
   *
   * This only makes sense for scheduled TODOs, like times or deadlines.
   */
  expirationDate?: Date;
}
