#!/usr/bin/env node

import { cli } from "./commands/base";
import { RunCommand } from "./commands/run";

cli.register(RunCommand);

cli.runExit(process.argv.slice(2));
