import { runTodone } from "@todone/core";
import { allPlugins } from "@todone/default-plugins";
import type { File } from "@todone/types";
import { Command, Option } from "clipanion";
import vfs from "vinyl-fs";

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    const results = runTodone(
      vfs.src(this.globs, {
        buffer: false,
        cwd: process.cwd(),
        cwdbase: true,
      }) as AsyncIterable<File>,
      { plugins: allPlugins }
    );

    for await (const result of results) {
      console.log(result);
    }
  }
}
