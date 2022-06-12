import runTodone from "@todone/core";
import { pluginsByName } from "@todone/default-plugins";
import reporter from "@todone/reporter-cli";
import { Command, Option } from "clipanion";
import { instantiatePlugins } from "../plugins";
import { makeSource } from "../source";

// @TODO date:2020-03-03
// @TODO date:2023-03-03

export class RunCommand extends Command {
  static paths = [Command.Default, ["run"]];

  globs = Option.Rest({ name: "globs", required: 1 });

  async execute() {
    await runTodone(makeSource(this.globs), reporter, [
      ...instantiatePlugins(pluginsByName, this.context.stderr),
    ]);
  }
}
