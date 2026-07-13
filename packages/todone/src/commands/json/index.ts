import { Command } from "clipanion";

export class JsonCommand extends Command {
  static paths = [["run", "--json"]];

  static usage = Command.Usage({
    description: "Run todone and output NDJSON",
    details: `
      Checks the TODOs in your code and prints one JSON object per line for machine consumption. Reporting hooks from configured plugins are not run.
    `,
    examples: [["Run with NDJSON output", "$0 run --json"]],
  });

  execute = async () => (await import("./impl")).default(this);
}
