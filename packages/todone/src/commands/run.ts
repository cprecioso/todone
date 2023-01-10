import { runTodoneAsync, runTodoneIterable, TodoneOptions } from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import { Command, Option } from "clipanion";
import { PassThrough, pipeline } from "node:stream";
import vfs from "vinyl-fs";
import { logCLIReports } from "../logger/cli";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  json = Option.Boolean("--json", false, {
    description: "Output results as newline-delimited JSON",
  });

  includeNodeModules = Option.Boolean("--include-node-modules", false, {
    description: "Include files in node_modules folders",
  });

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    const err = (err: string) => this.context.stderr.write(`${err}\n`);

    const files = pipeline(
      vfs.src(this.globs, {
        buffer: false,
        cwd: process.cwd(),
        cwdbase: true,
        ignore: !this.includeNodeModules ? "/**/node_modules/**/*" : undefined,
      }),
      new PassThrough({ objectMode: true }),
      () => {}
    );

    const options: TodoneOptions = {
      plugins: allPlugins,
      toleratePluginInstantiationErrors: true,
      warnLogger: err,
    };

    if (this.json) {
      const report = await runTodoneAsync(files, options);
      this.context.stdout.write(`${JSON.stringify(report)}\n`);
    } else {
      const reports = runTodoneIterable(files, options);
      const expiredResults = await logCLIReports(this.context.stdout, reports);
      return expiredResults > 0 ? 1 : 0;
    }
  }
}
