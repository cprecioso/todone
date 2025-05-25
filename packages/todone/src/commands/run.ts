import {
  getAnalysisPromise,
  getAnalysisStream,
  Options as TodoneOptions,
} from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import { fromEnv } from "@todone/plugin";
import { Command, Option } from "clipanion";
import { getFiles } from "../helpers/get-files";
import { logCLIReports } from "../logger/cli";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  keyword = Option.String("-k,--keyword", "@TODO");

  json = Option.Boolean("--json", false, {
    description: "Output results as newline-delimited JSON",
  });

  gitignore = Option.Boolean("--gitignore", true, {
    description:
      "Respect .gitignore patterns (on by default, use --no-gitignore to disable)",
  });

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    const err = (err: string) => this.context.stderr.write(`${err}\n`);

    const files = getFiles(this.globs, {
      cwd: process.cwd(),
      gitignore: this.gitignore,
    });

    const report = (reason: string) => (error: unknown) =>
      err(`${reason}: ${error}`);

    const plugins = await fromEnv(defaultPlugins, process.env, {
      onConfigError: report("Failure to load plugin config"),
      onInstancingError: report("Failure to load plugin"),
    });

    const options: TodoneOptions = {
      keyword: this.keyword,
      warnLogger: err,
      plugins: plugins,
    };

    if (this.json) {
      const report = await getAnalysisPromise(files, options);
      this.context.stdout.write(`${JSON.stringify(report)}\n`);
    } else {
      const reports = getAnalysisStream(files, options);
      const counters = await logCLIReports(this.context.stdout, reports);
      return counters.expiredResults > 0 ? 1 : 0;
    }
  }
}
