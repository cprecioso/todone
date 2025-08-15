#!/usr/bin/env node

import "dotenv/config";
import cli from "./commands";

await cli.runExit(process.argv.slice(2));
