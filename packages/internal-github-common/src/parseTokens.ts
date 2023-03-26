import { GITHUB_API_BASE_URL, normalizeHostname } from "./baseUrl";

export class TokenMap {
  protected _data: Map<string, string | null>;

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
  constructor(input = "") {
    this._data = parseInput(input);
  }

  has(hostname: string) {
    return this._data.has(normalizeHostname(hostname));
  }

  get(hostname: string) {
    return this._data.get(normalizeHostname(hostname));
  }

  getHosts() {
    return [...this._data.keys()];
  }

  makeRequest(...requestArgs: ConstructorParameters<typeof Request>) {
    const req = new Request(...requestArgs);
    const { hostname } = new URL(req.url);
    const token = this.get(hostname);
    if (token) req.headers.set("Authorization", `token ${token}`);
    return req;
  }
}

const parseInput = (input = "") =>
  new Map(
    ("," + input.trim().replace(/^,|,$/g, ""))
      .split(",")
      .map((pair) => parsePair(pair))
  );

const parsePair = (pair: string): [host: string, token: string | null] => {
  let [host, token] = pair.trim().split(":");

  if (token == undefined) {
    token = host;
    host = GITHUB_API_BASE_URL;
  }

  return [normalizeHostname(host), token || null];
};
