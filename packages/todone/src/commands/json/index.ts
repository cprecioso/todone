import { Command } from "clipanion";

export class JsonCommand extends Command {
  static paths = [["json"]];

  static usage = Command.Usage({
    description: "Run todone and output NDJSON",
    details: `
      Checks the TODOs in your code and prints one JSON object per line for machine consumption.
    `,
    examples: [["Run with NDJSON output", "$0 json"]],
  });

  execute = async () => (await import("./impl")).default(this);
}
