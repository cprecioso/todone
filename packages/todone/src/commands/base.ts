import pkg from "#/package.json" with { type: "json" };
import { Builtins, Cli } from "clipanion";

const cli = new Cli({
  binaryName: pkg.name,
  binaryVersion: pkg.version,
});

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

export { cli };
