import { Command, Option } from "clipanion";
import * as t from "typanion";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  static usage = Command.Usage({
    description: "Run the todone CLI",
    details:
      "Checks the TODOs in your code and prints human-readable output. Use `run --json` instead for NDJSON output, or `run --check` to only report through the exit code.",
    examples: [
      ["Run with human-readable output", "$0 run"],
      ["Only show expired TODOs", "$0 run --only-expired"],
      [
        "Warn instead of failing when no plugin handles a URL",
        "$0 run --unhandled-urls warn",
      ],
    ],
  });

  onlyExpired = Option.Boolean("--only-expired", false, {
    description: "Only print expired results",
  });

  locale = Option.String("--locale", {
    description: "Locale used to format dates; defaults to the system locale",
  });

  unhandledUrls = Option.String("--unhandled-urls", "error", {
    description:
      'What to do when no plugin returns a result for a URL: "error" (default), "warn", or "ignore"',
    validator: t.isEnum(["error", "warn", "ignore"] as const),
  });

  execute = async () => (await import("./impl")).default(this);
}
