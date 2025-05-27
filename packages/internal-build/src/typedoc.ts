import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { PackageJson } from "type-fest";
import type { TypeDocOptions } from "typedoc";

const exportConditions = new Set(["import", "default"]);

const iterateExports = function* (
  exportsField: PackageJson["exports"],
): Generator<string> {
  if (!exportsField) {
    return;
  }

  if (typeof exportsField === "string") {
    yield exportsField;
    return;
  }

  if (Array.isArray(exportsField)) {
    for (const e of exportsField) {
      yield* iterateExports(e);
    }
    return;
  }

  for (const [key, value] of Object.entries(exportsField)) {
    if (key.startsWith("./")) {
      yield* iterateExports(value);
    }
    if (exportConditions.has(key)) {
      yield* iterateExports(value);
      return;
    }
  }

  return [];
};

const inspectPackageJson = function* (pkgJson: PackageJson) {
  if (pkgJson.private) return;

  if (pkgJson.main) yield pkgJson.main;
  if (pkgJson.exports) yield* iterateExports(pkgJson.exports);
};

export const defaultConfig = (baseDir: string): TypeDocOptions => {
  const pkgJsonPath = new URL("./package.json", baseDir);

  const pkgJson: PackageJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));

  const pkgName = pkgJson.name;
  assert(pkgName, "package.json#name not found");

  const outputs = new Set<string>();
  if (pkgJson.main) outputs.add(pkgJson.main);
  if (pkgJson.exports) {
    for (const exportPath of iterateExports(pkgJson.exports)) {
      outputs.add(exportPath);
    }
  }

  const entryPoints = [...inspectPackageJson(pkgJson)]
    .map((file) =>
      file.replace(/^(?:.\/)?dist\//, "src/").replace(/\.js$/, ".ts"),
    )
    .filter((dir) => dir.endsWith(".ts"))
    .map((file) => path.normalize(file));

  return {
    json: "out-docs.json",
    entryPoints: [...new Set(entryPoints)],
  };
};
