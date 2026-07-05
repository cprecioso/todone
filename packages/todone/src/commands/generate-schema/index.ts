import { Command, Option } from "clipanion";

export class GenerateSchemaCommand extends Command {
  static paths = [["generate-schema"]];

  out = Option.String("-o,--out", {
    required: false,
    description:
      "Output file for the generated schema. If not specified or `-`, the schema will be printed to the console.",
  });

  execute = async () => (await import("./impl")).default(this);
}
