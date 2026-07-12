import { ReporterFn } from "#/plugin";
import type { UnknownRecord, ValueOf } from "type-fest";
import * as z from "zod";
import { cliReporter, CliReporterOptions } from "./cli";
import { jsonReporter, JsonReporterOptions } from "./json";

/** CLI output when stdout is a TTY, NDJSON otherwise. */
const autoReporter = (
  options?: CliReporterOptions & JsonReporterOptions,
): ReporterFn =>
  process.stdout.isTTY ? cliReporter(options) : jsonReporter(options);

const BUILTIN_REPORTERS = {
  auto: autoReporter,
  cli: cliReporter,
  json: jsonReporter,
} as const satisfies Record<string, (options?: UnknownRecord) => ReporterFn>;

type BuiltinReporter = keyof typeof BUILTIN_REPORTERS;

type ReporterSettings =
  | BuiltinReporter
  | ValueOf<{
      [K in BuiltinReporter]: {
        name: K;
        config?: Parameters<(typeof BUILTIN_REPORTERS)[K]>[0];
      };
    }>
  | ReporterFn;

export const ReporterSettingsSchema = z
  .custom<ReporterSettings>()
  .transform((value) => {
    if (typeof value === "function") return value;
    else if (typeof value === "string") return BUILTIN_REPORTERS[value]();
    else return BUILTIN_REPORTERS[value.name](value.config);
  }) satisfies z.ZodType<ReporterSettings>;
