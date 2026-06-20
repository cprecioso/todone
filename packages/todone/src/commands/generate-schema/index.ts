import { Option } from "clipanion";
import { EffectComand } from "../common";

export class GenerateSchemaCommand extends EffectComand {
  static paths = [["generate-schema"]];

  out = Option.String("-o,--out", {
    required: false,
    description:
      "Output file for the generated schema. If not specified or `-`, the schema will be printed to the console.",
  });

  effect = async () => (await import("./effect")).default(this);
}
