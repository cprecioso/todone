// @ts-check

import fse from "fs-extra";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "./compile.mjs";
import { format } from "./format.mjs";
import { makeCode } from "./make-code.mjs";

const pkgURL = new URL("../../package.json", import.meta.url);
const pkg = await fse.readJSON(fileURLToPath(pkgURL));
const allDeps = Object.keys(pkg.dependencies);

const code = makeCode(allDeps);

const mainFilePath = fileURLToPath(new URL(pkg.main, pkgURL));
const typesFilePath = fileURLToPath(new URL(pkg.types, pkgURL));

const { js, dts } = compile(code);

await fse.ensureDir(dirname(mainFilePath));
await Promise.all([
  fse.writeFile(mainFilePath, format(js)),
  fse.writeFile(typesFilePath, format(dts)),
]);
