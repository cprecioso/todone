import { Config } from "#/lib/config/schema";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Terminal from "@effect/platform/Terminal";
import * as Effect from "effect/Effect";
import * as JSONSchema from "effect/JSONSchema";
import { GenerateSchemaCommand } from "./index";

export default (command: GenerateSchemaCommand) =>
  Effect.gen(function* () {
    const jsonSchema = JSONSchema.make(Config);
    const jsonSchemaString = JSON.stringify(jsonSchema, null, 2);

    if (!command.out || command.out === "-") {
      const term = yield* Terminal.Terminal;
      yield* term.display(jsonSchemaString);
    } else {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(command.out, jsonSchemaString);
    }
  });
