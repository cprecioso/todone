import { PluginContainer, PluginError } from "#/lib/container";
import type { Plugin } from "#/plugin";
import type * as t from "#/types";
import { describe, expect, it, vi } from "vitest";

const url = new URL("test:some-url");

const result = (title: string): t.Result["result"] => ({
  title,
  isExpired: false,
});

const never = () => new Promise<never>(() => {});

describe("PluginContainer.checkMatch", () => {
  it("settles on the first plugin to return a result", async () => {
    const container = new PluginContainer([
      { name: "slow", checkMatch: never },
      { name: "fast", checkMatch: async () => result("fast") },
    ]);

    await expect(container.checkMatch({ url })).resolves.toEqual(
      result("fast"),
    );
  });

  it("returns null when every plugin declines the URL", async () => {
    const container = new PluginContainer([
      { name: "a", checkMatch: async () => null },
      { name: "b", checkMatch: async () => null },
    ]);

    await expect(container.checkMatch({ url })).resolves.toBeNull();
  });

  it("returns null when no plugin implements checkMatch", async () => {
    const container = new PluginContainer([{ name: "reporter-only" }]);

    await expect(container.checkMatch({ url })).resolves.toBeNull();
  });

  it("wraps a single failure in a PluginError naming the plugin and URL", async () => {
    const cause = new Error("boom");
    const container = new PluginContainer([
      { name: "declines", checkMatch: async () => null },
      {
        name: "explodes",
        checkMatch: async () => {
          throw cause;
        },
      },
    ]);

    const error = await container.checkMatch({ url }).then(
      () => expect.unreachable("should have thrown"),
      (error: unknown) => error,
    );

    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).message).toBe(
      'Plugin "explodes" failed while checking test:some-url',
    );
    expect((error as PluginError).cause).toBe(cause);
  });

  it("aggregates multiple failures into an AggregateError", async () => {
    const throwing = (name: string): Plugin => ({
      name,
      checkMatch: async () => {
        throw new Error(name);
      },
    });
    const container = new PluginContainer([throwing("one"), throwing("two")]);

    const error = await container.checkMatch({ url }).then(
      () => expect.unreachable("should have thrown"),
      (error: unknown) => error,
    );

    expect(error).toBeInstanceOf(AggregateError);
    expect((error as AggregateError).message).toBe(
      "Multiple plugins failed while checking test:some-url",
    );
    expect((error as AggregateError).errors).toHaveLength(2);
    for (const inner of (error as AggregateError).errors) {
      expect(inner).toBeInstanceOf(PluginError);
    }
  });

  it("prefers a real result over failures from other plugins", async () => {
    const container = new PluginContainer([
      {
        name: "explodes",
        checkMatch: () => Promise.reject(new Error("boom")),
      },
      { name: "answers", checkMatch: async () => result("answers") },
    ]);

    await expect(container.checkMatch({ url })).resolves.toEqual(
      result("answers"),
    );
  });
});

describe("PluginContainer plugin handling", () => {
  it("flattens arbitrarily nested plugin options", async () => {
    const seen: string[] = [];
    const plugin = (name: string): Plugin => ({
      name,
      checkMatch: async () => {
        seen.push(name);
        return null;
      },
    });

    const container = new PluginContainer([
      plugin("a"),
      [plugin("b"), [plugin("c")]],
    ]);
    await container.checkMatch({ url });

    expect(seen.sort()).toEqual(["a", "b", "c"]);
  });

  it("fans reporting hooks out to every plugin", async () => {
    const reportFileA = vi.fn<NonNullable<Plugin["reportFile"]>>(
      async () => {},
    );
    const reportFileB = vi.fn<NonNullable<Plugin["reportFile"]>>(
      async () => {},
    );
    const container = new PluginContainer([
      { name: "a", reportFile: reportFileA },
      { name: "b", reportFile: reportFileB },
    ]);

    const file: t.File = { localPath: "x.txt", fullPath: "/x.txt" };
    await container.reportFile(file);

    expect(reportFileA).toHaveBeenCalledExactlyOnceWith(file);
    expect(reportFileB).toHaveBeenCalledExactlyOnceWith(file);
  });

  it("fans context logging out to every plugin", () => {
    const warnA = vi.fn<NonNullable<Plugin["warn"]>>();
    const warnB = vi.fn<NonNullable<Plugin["warn"]>>();
    const container = new PluginContainer([
      { name: "a", warn: warnA },
      { name: "b", warn: warnB },
    ]);

    container.warn("careful");

    expect(warnA).toHaveBeenCalledExactlyOnceWith("careful");
    expect(warnB).toHaveBeenCalledExactlyOnceWith("careful");
  });

  it("lets a plugin reach the shared context through `this`", async () => {
    const warn = vi.fn<NonNullable<Plugin["warn"]>>();
    const container = new PluginContainer([
      { name: "logger", warn },
      {
        name: "complainer",
        async checkMatch() {
          this.warn("seen it");
          return null;
        },
      },
    ]);

    await container.checkMatch({ url });

    expect(warn).toHaveBeenCalledExactlyOnceWith("seen it");
  });
});
