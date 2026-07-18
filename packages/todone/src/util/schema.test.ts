import { describe, expect, expectTypeOf, it } from "vitest";
import * as z from "zod";
import { shorthands } from "./schema";

const globs = shorthands(z.string().array(), [
  z.string().transform((pattern) => [pattern]),
]);

describe("shorthands", () => {
  it("accepts the canonical input", () => {
    expect(globs.parse(["a", "b"])).toEqual(["a", "b"]);
  });

  it("pipes a shorthand input through the canonical schema", () => {
    expect(globs.parse("a")).toEqual(["a"]);
  });

  it("rejects inputs that match neither form", () => {
    expect(() => globs.parse(42)).toThrow(z.ZodError);
    expect(() => globs.parse([42])).toThrow(z.ZodError);
  });

  it("supports nested shorthands", () => {
    const nested = shorthands(z.object({ patterns: z.string().array() }), [
      globs.transform((patterns) => ({ patterns })),
    ]);

    expect(nested.parse("a")).toEqual({ patterns: ["a"] });
    expect(nested.parse(["a", "b"])).toEqual({ patterns: ["a", "b"] });
    expect(nested.parse({ patterns: ["a"] })).toEqual({ patterns: ["a"] });
  });

  it("exposes the shorthand inputs in the schema's input type", () => {
    expectTypeOf<z.input<typeof globs>>().toEqualTypeOf<string[] | string>();
    expectTypeOf<z.output<typeof globs>>().toEqualTypeOf<string[]>();
  });
});
