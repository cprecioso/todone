import { Command } from "clipanion";

export class CheckCommand extends Command {
  static paths = [["run", "--check"]];

  static usage = Command.Usage({
    description: "Run todone and only report through the exit code",
    details: `
      Checks the TODOs in your code without printing anything. Exits with code 1 if any TODO is expired, 0 otherwise. Reporting hooks from configured plugins are not run.
    `,
    examples: [["Run with exit-code-only output", "$0 run --check"]],
  });

  execute = async () => (await import("./impl")).default(this);
}
