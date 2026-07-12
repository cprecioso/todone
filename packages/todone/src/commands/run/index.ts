import { Command } from "clipanion";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  static usage = Command.Usage({ description: "Run the todone CLI" });

  execute = async () => (await import("./impl")).default(this);
}
