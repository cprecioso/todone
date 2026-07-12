import { cli } from "./base";
import { JsonCommand } from "./json";
import { RunCommand } from "./run";

cli.register(RunCommand);
cli.register(JsonCommand);

export default cli;
