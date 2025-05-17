import {
  getReportsPromise,
  getReportStream,
  TodoneOptions,
} from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
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

    const options: TodoneOptions = {
      keyword: this.keyword,
      toleratePluginInstantiationErrors: true,
      warnLogger: err,
      plugins: defaultPlugins,
    };

    if (this.json) {
      const report = await getReportsPromise(files, options);
      this.context.stdout.write(`${JSON.stringify(report)}\n`);
    } else {
      const reports = getReportStream(files, options);
      const expiredResults = await logCLIReports(this.context.stdout, reports);
      return expiredResults > 0 ? 1 : 0;
    }
  }
}
