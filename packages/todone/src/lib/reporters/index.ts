import { Reporter, ReporterFn } from "#/plugin";
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

type ReportersSettings = ReporterSettings | ReporterSettings[];

const resolveReporter = (value: ReporterSettings): ReporterFn => {
  if (typeof value === "function") return value;
  else if (typeof value === "string") return BUILTIN_REPORTERS[value]();
  else return BUILTIN_REPORTERS[value.name](value.config);
};

/** A reporter that initializes each given reporter and forwards every event to all of them. */
const combineReporters =
  (reporterFns: ReporterFn[]): ReporterFn =>
  async (): Promise<Reporter> => {
    const reporters = await Promise.all(reporterFns.map((fn) => fn()));

    const all =
      <K extends keyof Reporter>(name: K): Reporter[K] =>
      async (
        // @ts-expect-error
        ...args
      ) => {
        await Promise.all(
          reporters.map((r) =>
            r[name](
              // @ts-expect-error
              ...args,
            ),
          ),
        );
      };

    return {
      warn: all("warn"),
      info: all("info"),
      debug: all("debug"),

      reportFile: all("reportFile"),
      reportMatch: all("reportMatch"),
      reportResult: all("reportResult"),

      [Symbol.asyncDispose]: all(Symbol.asyncDispose),
    };
  };

export const ReportersSettingsSchema = z
  .custom<ReportersSettings>()
  .transform((value): ReporterFn => {
    const reporterFns = (Array.isArray(value) ? value : [value]).map(
      resolveReporter,
    );
    return combineReporters(reporterFns);
  });
