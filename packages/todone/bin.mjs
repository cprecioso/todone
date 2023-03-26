#!/usr/bin/env node

import * as dotenv from "dotenv";
dotenv.config();

const { cli } = await import("./dist/bin.mjs");
await cli.runExit(process.argv.slice(2));
