import { jsonReporter } from "../../lib/reporters";
import { execute } from "../shared";
import { JsonCommand } from "./index";

export default async ({}: JsonCommand) => execute(jsonReporter());
