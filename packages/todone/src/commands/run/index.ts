import { Command, Option } from "clipanion";
import { EffectComand } from "../common";

export class RunCommand extends EffectComand {
  static paths = [Command.Default, ["run"]];

  keyword = Option.String("-k,--keyword", "@TODO");

  onlyExpired = Option.Boolean("--only-expired", false, {
    description: "Only show expired items (ignored if --json is used)",
  });

  json = Option.Boolean("--json", false, {
    description: "Output results as newline-delimited JSON",
  });

  gitignore = Option.Boolean("--gitignore", true, {
    description:
      "Respect .gitignore patterns (on by default, use --no-gitignore to disable)",
  });

  globs = Option.Rest({ name: "globs", required: 1 });

  effect = async () => (await import("./effect")).makeRunEffect(this);
}
