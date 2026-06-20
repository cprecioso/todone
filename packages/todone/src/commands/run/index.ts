import { Command, Option } from "clipanion";
import { EffectComand } from "../common";

export class RunCommand extends EffectComand {
  static paths = [Command.Default, ["run"]];

  static usage = Command.Usage({ description: "Run the todone CLI" });

  reporter = Option.String("-r,--reporter", {
    description:
      "Override reporter to use (auto, cli, json, or a custom reporter module)",
  });

  effect = async () => (await import("./effect")).default(this);
}
