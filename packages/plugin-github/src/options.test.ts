import { beforeEach, describe, expect, it, vi } from "vitest";

// `isGithubActionsEnv` is a module-level constant, so the module must be
// (re-)imported after the environment is stubbed.
const importSchema = async () => {
  const { GithubPluginOptionsSchema } = await import("./options");
  return GithubPluginOptionsSchema;
};

beforeEach(() => {
  vi.resetModules();
});

describe("GithubPluginOptionsSchema", () => {
  it("defaults to a checker-only, tokenless setup outside GitHub Actions", async () => {
    const schema = await importSchema();

    expect(schema.parse({})).toEqual({
      token: undefined,
      context: {
        server: "https://github.com",
        repository: undefined,
        sha: undefined,
      },
      actions: { logger: false, summary: false },
      createIssues: false,
    });
  });

  it("enables the Actions integrations inside GitHub Actions", async () => {
    vi.stubEnv("GITHUB_ACTIONS", "true");
    const schema = await importSchema();

    expect(schema.parse({}).actions).toEqual({ logger: true, summary: true });
  });

  it("reads the token and context from the environment", async () => {
    vi.stubEnv("GITHUB_TOKEN", "env-token");
    vi.stubEnv("GITHUB_REPOSITORY", "octo/repo");
    vi.stubEnv("GITHUB_SERVER_URL", "https://github.example.com");
    vi.stubEnv("GITHUB_SHA", "abc123");
    const schema = await importSchema();

    expect(schema.parse({})).toMatchObject({
      token: "env-token",
      context: {
        server: "https://github.example.com",
        repository: { owner: "octo", repo: "repo" },
        sha: "abc123",
      },
    });
  });

  it("prefers explicit options over the environment", async () => {
    vi.stubEnv("GITHUB_TOKEN", "env-token");
    const schema = await importSchema();

    expect(schema.parse({ token: "explicit" }).token).toBe("explicit");
  });

  it("expands createIssues: true into its option defaults", async () => {
    const schema = await importSchema();

    expect(schema.parse({ createIssues: true }).createIssues).toEqual({
      label: "todone",
    });
    expect(
      schema.parse({ createIssues: { label: "custom" } }).createIssues,
    ).toEqual({ label: "custom" });
    expect(schema.parse({ createIssues: false }).createIssues).toBe(false);
  });

  it("rejects a repository that is not in owner/repo form", async () => {
    const schema = await importSchema();

    expect(() => schema.parse({ context: { repository: "no-slash" } })).toThrow(
      /Invalid/,
    );
  });
});
