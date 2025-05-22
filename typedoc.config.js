// @ts-check

import * as fs from "node:fs";
import path from "node:path";
import pkg from "./package.json" with { type: "json" };

const entryPoints = fs
  .globSync(pkg.workspaces, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join(dirent.parentPath, dirent.name))
  .filter((dir) => {
    if (!fs.existsSync(path.join(dir, "package.json"))) return false;
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
    );
    if (packageJson.private || packageJson.internal) return false;
    return true;
  });

export default /** @type {import("typedoc").TypeDocOptions} */ ({
  entryPointStrategy: "packages",
  entryPoints: entryPoints,
  includeVersion: true,
  packageOptions: {
    includeVersion: true,
    excludeInternal: true,
  },
  plugin: ["typedoc-plugin-dt-links", "typedoc-plugin-mdn-links"],
});
