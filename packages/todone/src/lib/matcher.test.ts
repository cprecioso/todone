import { makeFileMatcher } from "#/lib/matcher";
import type * as t from "#/types";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const collect = async <T>(iterable: AsyncIterable<T>) => {
  const items: T[] = [];
  for await (const item of iterable) items.push(item);
  return items;
};

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-matcher-"));
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const makeFile = async (contents: string): Promise<t.File> => {
  const fullPath = path.join(dir, "input.txt");
  await fs.writeFile(fullPath, contents);
  return { localPath: "input.txt", fullPath };
};

describe("makeFileMatcher", () => {
  it("finds a match with its URL and 1-based position", async () => {
    const file = await makeFile("// @TODO https://example.com/x\n");
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches).toHaveLength(1);
    expect(matches[0]!.url).toBeInstanceOf(URL);
    expect(matches[0]!.url.href).toBe("https://example.com/x");
    expect(matches[0]!.position).toEqual({ line: 1, column: 4 });
    expect(matches[0]!.file).toBe(file);
  });

  it("finds multiple matches on the same line", async () => {
    const file = await makeFile("@TODO test:a and @TODO test:b\n");
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches.map((m) => m.url.href)).toEqual(["test:a", "test:b"]);
    expect(matches.map((m) => m.position)).toEqual([
      { line: 1, column: 1 },
      { line: 1, column: 18 },
    ]);
  });

  it("tracks line numbers across lines", async () => {
    const file = await makeFile(
      "first\n\n@TODO test:third\ntext @TODO test:fourth\n",
    );
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches.map((m) => m.position)).toEqual([
      { line: 3, column: 1 },
      { line: 4, column: 6 },
    ]);
  });

  it("escapes regex metacharacters in the keyword", async () => {
    const file = await makeFile("*TODO test:starred\nxTODO test:regex-dot\n");
    const matches = await collect(makeFileMatcher("*TODO")(file));

    // `*` must be treated literally: it matches line 1 but must not act as a
    // quantifier that would also match `xTODO` on line 2.
    expect(matches.map((m) => m.url.href)).toEqual(["test:starred"]);
  });

  it("requires whitespace between the keyword and the URL", async () => {
    const file = await makeFile("@TODOX test:nope\n@TODO\ttest:tab\n");
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches.map((m) => m.url.href)).toEqual(["test:tab"]);
  });

  it("parses non-http URL schemes such as date:", async () => {
    const file = await makeFile("// @TODO date:2024-01-01\n");
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches[0]!.url.protocol).toBe("date:");
    expect(matches[0]!.url.href).toBe("date:2024-01-01");
  });

  it("throws when the token after the keyword is not a valid URL", async () => {
    const file = await makeFile("// @TODO not-a-url\n");

    await expect(collect(makeFileMatcher("@TODO")(file))).rejects.toThrow(
      /Invalid URL/,
    );
  });

  it("yields nothing for an empty file", async () => {
    const file = await makeFile("");
    const matches = await collect(makeFileMatcher("@TODO")(file));

    expect(matches).toEqual([]);
  });
});
