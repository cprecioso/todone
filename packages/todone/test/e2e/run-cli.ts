import { execFile } from "node:child_process";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BIN = fileURLToPath(new URL("../../dist/bin.js", import.meta.url));

export interface CliRun {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/** Runs the built CLI in `cwd` with a minimal, deterministic environment. */
export const runCli = async (
  cwd: string,
  args: readonly string[] = [],
): Promise<CliRun> => {
  if (!fs.existsSync(BIN)) {
    throw new Error(
      `${BIN} does not exist — build it first with \`yarn nx run todone:build\``,
    );
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [BIN, ...args],
      {
        cwd,
        env: {
          PATH: process.env["PATH"]!,
          ...(process.env["HOME"] ? { HOME: process.env["HOME"] } : {}),
          TZ: "UTC",
          NO_COLOR: "1",
          FORCE_COLOR: "0",
          LC_ALL: "C",
        },
      },
    );
    return { stdout, stderr, exitCode: 0 };
  } catch (error) {
    const {
      stdout = "",
      stderr = "",
      code,
    } = error as { stdout?: string; stderr?: string; code?: number };
    return { stdout, stderr, exitCode: code ?? 1 };
  }
};

export const fixtureDir = (name: string) =>
  fileURLToPath(new URL(`../fixtures/${name}/`, import.meta.url)).replace(
    /\/$/,
    "",
  );

/** Replaces absolute paths under `dir` so snapshots are machine-independent. */
export const normalize = (output: string, dir: string) =>
  output.replaceAll(dir, "<FIXTURE>");
