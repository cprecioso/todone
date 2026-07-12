import * as z from "zod";

/** @see https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md */
const Packument = z.object({
  versions: z.record(z.string(), z.unknown()),
});

export const fetchPackageVersions = async (
  registry: URL,
  name: string,
): Promise<string[]> => {
  const url = new URL(name.replace("/", "%2F"), registry);

  const response = await fetch(url, {
    headers: {
      // Prefer the abbreviated packument, which is much smaller than the full
      // one, but still lists every published version.
      accept:
        "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8",
    },
  });

  if (response.status === 404) {
    throw new Error(`Package \`${name}\` not found in registry ${registry}`);
  }

  if (!response.ok) {
    throw new Error(
      `Registry request for \`${name}\` failed: ${response.status} ${response.statusText}`,
    );
  }

  const packument = Packument.parse(await response.json());
  return Object.keys(packument.versions);
};
