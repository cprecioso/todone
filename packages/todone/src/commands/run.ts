import { runTodone } from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import { Command, Option } from "clipanion";
import { PassThrough, pipeline } from "node:stream";
import vfs from "vinyl-fs";
import { logCLIResults } from "../logger/cli";
import { logJSONResults } from "../logger/json";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  json = Option.Boolean("--json", false, {
    description: "Output results as newline-delimited JSON",
  });

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    const err = (err: string) => this.context.stderr.write(`${err}\n`);

    const results = runTodone(
      pipeline(
        vfs.src(this.globs, {
          buffer: false,
          cwd: process.cwd(),
          cwdbase: true,
        }),
        new PassThrough({ objectMode: true }),
        () => {}
      ),
      {
        plugins: allPlugins,
        toleratePluginInstantiationErrors: true,
        warnLogger: err,
      }
    );

    if (this.json) {
      await logJSONResults(this.context.stdout, results);
    } else {
      const expiredResults = await logCLIResults(this.context.stdout, results);
      return expiredResults > 0 ? 1 : 0;
    }
  }
}
