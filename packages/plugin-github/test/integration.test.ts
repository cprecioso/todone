import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { run } from "todone";
import type { Plugin } from "todone/plugin";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import githubPlugin from "../src/index";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let dir: string;
let previousCwd: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-github-"));
  previousCwd = process.cwd();
  process.chdir(dir);
});
afterEach(async () => {
  process.chdir(previousCwd);
  await fs.rm(dir, { recursive: true, force: true });
});

const api = "https://api.github.com";

describe("githubPlugin through the todone pipeline", () => {
  it("resolves issue TODOs hermetically, mirroring the old test-app", async () => {
    const authHeaders: (string | null)[] = [];

    server.use(
      http.get(`${api}/repos/todone-run/todone/issues/1`, ({ request }) => {
        authHeaders.push(request.headers.get("authorization"));
        return HttpResponse.json({
          title: "A closed issue",
          state: "closed",
          closed_at: "2023-01-02T03:04:05Z",
        });
      }),
      http.get(`${api}/repos/actions/runner/issues/3600`, ({ request }) => {
        authHeaders.push(request.headers.get("authorization"));
        return HttpResponse.json({
          title: "A still-open issue",
          state: "open",
          closed_at: null,
        });
      }),
    );

    await fs.writeFile(
      path.join(dir, "hello.ts"),
      [
        "// @TODO https://github.com/todone-run/todone/issues/1",
        "// @TODO https://github.com/actions/runner/issues/3600",
        "// @TODO https://sgithub.com/actions/runner/issues/3600",
        "",
      ].join("\n"),
    );

    const results = await run({
      keyword: "@TODO",
      gitignore: false,
      globs: ["**/*"],
      plugins: [
        githubPlugin({
          token: "test-token",
          actions: { logger: false, summary: false },
        }),
      ],
    });

    const byUrl = new Map(results.map((result) => [result.url.href, result]));

    expect(
      byUrl.get("https://github.com/todone-run/todone/issues/1")!.result,
    ).toEqual({
      title: "A closed issue",
      isExpired: true,
      expirationDate: new Date("2023-01-02T03:04:05Z"),
    });

    expect(
      byUrl.get("https://github.com/actions/runner/issues/3600")!.result,
    ).toEqual({
      title: "A still-open issue",
      isExpired: false,
      expirationDate: undefined,
    });

    // The typo host matches no plugin; nothing was requested for it.
    expect(
      byUrl.get("https://sgithub.com/actions/runner/issues/3600")!.result,
    ).toBeNull();

    expect(authHeaders).toEqual(["token test-token", "token test-token"]);
  });

  it("surfaces API failures as plugin errors", async () => {
    server.use(
      http.get(`${api}/repos/octo/repo/issues/404`, () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    const [checker] = githubPlugin({ token: "test-token" }) as Plugin[];

    await expect(
      checker!.checkMatch!.call(
        {
          warn: vi.fn<(message: string) => void>(),
          info: vi.fn<(message: string) => void>(),
          debug: vi.fn<(message: string) => void>(),
        },
        { url: new URL("https://github.com/octo/repo/issues/404") },
      ),
    ).rejects.toThrow(/Not Found/);
  });
});

describe("githubPlugin issue syncing", () => {
  it("creates a labeled issue with an embedded data zone for a new expired TODO", async () => {
    const created: unknown[] = [];

    server.use(
      http.get(`${api}/repos/octo/repo/issues/7`, () =>
        HttpResponse.json({
          title: "Fix everything",
          state: "closed",
          closed_at: "2023-01-02T03:04:05Z",
        }),
      ),
      // The reconciler lists currently-open todone-labeled issues: none.
      http.get(`${api}/repos/octo/repo/issues`, () => HttpResponse.json([])),
      http.post(`${api}/repos/octo/repo/issues`, async ({ request }) => {
        created.push(await request.json());
        return HttpResponse.json(
          { number: 99, title: "created" },
          { status: 201 },
        );
      }),
    );

    await fs.writeFile(
      path.join(dir, "hello.ts"),
      "// @TODO https://github.com/octo/repo/issues/7\n",
    );

    await run({
      keyword: "@TODO",
      gitignore: false,
      globs: ["**/*"],
      plugins: [
        githubPlugin({
          token: "test-token",
          context: { repository: "octo/repo", sha: "abc123" },
          actions: { logger: false, summary: false },
          createIssues: true,
        }),
      ],
    });

    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      title: "TODO: Fix everything",
      labels: ["todone"],
    });
    const body = (created[0] as { body: string }).body;
    expect(body).toContain("todone start");
    expect(body).toContain(
      JSON.stringify({ todoUrl: "https://github.com/octo/repo/issues/7" }),
    );
    expect(body).toContain("blob/abc123");
  });
});
