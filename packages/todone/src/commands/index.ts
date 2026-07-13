import { cli } from "./base";
import { CheckCommand } from "./check";
import { JsonCommand } from "./json";
import { RunCommand } from "./run";

cli.register(RunCommand);
cli.register(JsonCommand);
cli.register(CheckCommand);

export default cli;
