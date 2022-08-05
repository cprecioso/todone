import { runTodone } from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import { getMatchId } from "@todone/types";
import { Command, Option } from "clipanion";
import { PassThrough, pipeline } from "node:stream";
import vfs from "vinyl-fs";

const dateFormatter = new Intl.DateTimeFormat();

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    let exitCode = 0;

    const log = this.context.stdout.write.bind(this.context.stdout);
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

    for await (const { match, result } of results) {
      log(`${getMatchId(match)}\n`);
      log(`${match.url.href}\n`);

      if (!result) {
        log(`\tCouldn't find a match\n`);
        exitCode &= 0b1;
      } else if (result.isExpired) {
        log(`\tEXPIRED\n`);
        exitCode &= 0b10;
      } else {
        log(`\tNot yet expired\n`);
      }

      if (result?.expiration) {
        log(`\ton ${dateFormatter.format(result.expiration.date)}\n`);
        if (result.expiration.isApproximation) {
          log(`\t(approximately)\n`);
        }
      }

      log(`\n`);

      return exitCode;
    }
  }
}
