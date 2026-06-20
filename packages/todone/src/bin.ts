#!/usr/bin/env node

import cli from "./commands";

await cli.runExit(process.argv.slice(2));
