import { Builtins, Cli } from "clipanion";
import pkg from "../../package.json" assert { type: "json" };

export const cli = new Cli({
  binaryName: pkg.name,
  binaryVersion: pkg.version,
});

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
