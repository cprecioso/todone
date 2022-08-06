import { runTodone } from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import { Command, Option } from "clipanion";
import { PassThrough, pipeline } from "node:stream";
import vfs from "vinyl-fs";
import { logResults } from "../logger";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

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

    const expiredResults = await logResults(this.context.stdout, results);

    return expiredResults > 0 ? 1 : 0;
  }
}
