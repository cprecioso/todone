import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { run } from "todone";
import { afterEach, beforeEach, expect, it } from "vitest";
import datePlugin from "../src/index";

let dir: string;
let previousCwd: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-date-"));
  previousCwd = process.cwd();
  process.chdir(dir);
});
afterEach(async () => {
  process.chdir(previousCwd);
  await fs.rm(dir, { recursive: true, force: true });
});

it("resolves date: TODOs through the full todone pipeline", async () => {
  await fs.writeFile(
    path.join(dir, "notes.txt"),
    "@TODO date:2000-01-01\n@TODO date:9999-01-01\n",
  );

  const results = await run({
    keyword: "@TODO",
    include: { patterns: ["**/*"] },
    exclude: { gitignore: false, patterns: [] },
    plugins: [datePlugin()],
  });

  const byUrl = new Map(results.map((result) => [result.url.href, result]));

  expect(byUrl.get("date:2000-01-01")!.result).toMatchObject({
    isExpired: true,
    expirationDate: new Date("2000-01-01T00:00:00Z"),
  });
  expect(byUrl.get("date:9999-01-01")!.result).toMatchObject({
    isExpired: false,
  });
});
