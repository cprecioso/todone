import { cliReporter } from "../../lib/reporters";
import { execute } from "../shared";
import { RunCommand } from "./index";

export default async ({ onlyExpired, locale }: RunCommand) =>
  execute(cliReporter({ onlyExpired, locale }));
