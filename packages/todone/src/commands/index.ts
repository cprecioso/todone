import { cli } from "./base";
import { GenerateSchemaCommand } from "./generate-schema";
import { RunCommand } from "./run";

cli.register(RunCommand);
cli.register(GenerateSchemaCommand);

export default cli;
