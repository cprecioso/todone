import { Config } from "#/lib/config/schema";
import * as fs from "node:fs/promises";
import * as z from "zod";
import { GenerateSchemaCommand } from "./index";

export default async (command: GenerateSchemaCommand) => {
  const jsonSchema = z.toJSONSchema(Config);
  const jsonSchemaString = JSON.stringify(jsonSchema, null, 2);

  if (!command.out || command.out === "-") {
    console.log(jsonSchemaString);
  } else {
    await fs.writeFile(command.out, jsonSchemaString);
  }
};
