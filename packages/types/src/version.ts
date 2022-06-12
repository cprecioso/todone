import semver from "semver";
// @ts-expect-error No JSON configured for TypeScript
import pkg from "../package.json" assert { type: "json" };

export const VERSION = /*#__PURE__*/ semver.parse(pkg.version)!.major;
