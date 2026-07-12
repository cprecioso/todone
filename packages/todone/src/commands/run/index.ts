import { Command, Option } from "clipanion";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  static usage = Command.Usage({
    description: "Run the todone CLI",
    details: `
      Checks the TODOs in your code and prints human-readable output. Use the \`json\` command instead for NDJSON output.
    `,
    examples: [
      ["Run with human-readable output", "$0 run"],
      ["Only show expired TODOs", "$0 run --only-expired"],
    ],
  });

  onlyExpired = Option.Boolean("--only-expired", false, {
    description: "Only print expired results",
  });

  locale = Option.String("--locale", {
    description: "Locale used to format dates; defaults to the system locale",
  });

  execute = async () => (await import("./impl")).default(this);
}
