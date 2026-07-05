/**
 * A Checker represents the implementation of a kind of check that can be run
 * against a TODO URL.
 *
 * For example, a GitHub plugin might check if a URL points to a GitHub issue or
 * PR, and if so, whether that issue or PR is still open.
 */
export interface Checker {
  /**
   * An [Effect](https://effect.website/docs/getting-started/the-effect-type/)
   * for checking if a URL should be considered as expired or not.
   */
  checkMatch(options: { url: URL }): Promise<CheckerResult | null>;
}

/**
 * The result of running a {@link Checker}'s check against a URL, indicating whether the
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
