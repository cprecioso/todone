/**
 * The token string should be a couple of key-value pairs
 * with the key being the GitHub instance hostname, and
 * the value being the token needed to access it.
 *
 * The delimiter between key and value is `:`, and the
 * separator between pairs is `,`.
 *
 * A single value denotes a `github.com` token.
 *
 * A pair with no value part denotes a custom GitHub
 * instance that doesn't need a token to access.
 *
 * For example:
 *
 *     "ghp_123abc456def,git.myco.com:ghp_987zyx654wvu,public.myco.com:"
 *
 * `ghp_123abc456def` will be associated with `github.com`,
 * `ghp_987zyx654wvu` will be associated with `git.myco.com`,
 * and we ask the plugin to access `public.myco.com` but
 * without a token.
 */
export const parseTokens = (input = "") =>
  new Map(
    ("," + input.trim().replace(/^,|,$/g, ""))
      .split(",")
      .map((pair) => parsePair(pair))
  );

const parsePair = (pair: string): [host: string, token: string | null] => {
  let [host, token] = pair.trim().split(":");

  if (token == undefined) {
    token = host;
    host = "github.com";
  }

  if (
    host === "github.com" ||
    host === "www.github.com" ||
    host === "api.github.com"
  ) {
    return ["api.github.com", token || null];
  }

  return [host, token || null];
};
