import { Command, Option } from "clipanion";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  static usage = Command.Usage({ description: "Run the todone CLI" });

  reporter = Option.String("-r,--reporter", {
    description:
      "Override reporter to use (auto, cli, json, or a custom reporter module)",
  });

  execute = async () => (await import("./impl")).default(this);
}
