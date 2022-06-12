import { Builtins, Cli } from "clipanion";
// @ts-expect-error No JSON configured for TypeScript
import pkg from "../../package.json" assert { type: "json" };

export const cli = new Cli({
  binaryName: pkg.name,
  binaryVersion: pkg.version,
});

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
