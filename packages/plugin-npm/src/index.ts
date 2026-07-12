import * as semver from "semver";
import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { fetchPackageVersions } from "./lib";

const specPattern = /^(?<name>(?:@[^/@]+\/)?[^/@]+)@(?<range>.+)$/;

const Spec = z.object({
  name: z.string(),
  range: z.string(),
});

export interface NpmPluginOptions {
  /**
   * Base URL of the npm registry to query. Defaults to
   * `process.env.NPM_CONFIG_REGISTRY`, or the public npm registry.
   */
  registry?: string | URL;
}

const npmPlugin = ({
  registry = process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org/",
}: NpmPluginOptions = {}): Plugin => {
  // A trailing slash so package names resolve relative to the registry path.
  const registryUrl = new URL(registry);
  if (!registryUrl.pathname.endsWith("/")) registryUrl.pathname += "/";

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      if (url.protocol !== "npm:") return null;

      const specMatch = specPattern.exec(decodeURIComponent(url.pathname));
      if (!specMatch) {
        throw new Error(
          `Invalid npm specifier ${url}. Expected \`npm:package-name@semver-range\`.`,
        );
      }

      const { name, range } = Spec.parse(specMatch.groups);

      if (semver.validRange(range) == null) {
        throw new Error(`Invalid semver range \`${range}\` in ${url}`);
      }

      const versions = await fetchPackageVersions(registryUrl, name);
      const satisfyingVersion = semver.maxSatisfying(versions, range);

      return {
        title:
          satisfyingVersion == null
            ? `${name}@${range}`
            : `${name}@${range} (satisfied by v${satisfyingVersion})`,
        isExpired: satisfyingVersion != null,
      };
    },
  };
};

export default npmPlugin;
