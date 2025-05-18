#!/usr/bin/env node

import "dotenv/config";

const { cli } = await import("./commands");
await cli.runExit(process.argv.slice(2));
