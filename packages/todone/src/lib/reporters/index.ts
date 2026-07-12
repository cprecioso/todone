import { Reporter } from "#/plugin";
import { cliReporter, CliReporterOptions } from "./cli";
import { jsonReporter } from "./json";

export * from "./cli";
export * from "./json";

/** CLI output when stdout is a TTY, NDJSON otherwise. */
export const autoReporter = (cliOptions?: CliReporterOptions): Reporter =>
  process.stdout.isTTY ? cliReporter(cliOptions) : jsonReporter();
