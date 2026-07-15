import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import datePlugin from "./index";

const check = (url: string) => {
  const plugin = datePlugin();
  return plugin.checkMatch!.call(
    {
      warn: vi.fn<(message: string) => void>(),
      info: vi.fn<(message: string) => void>(),
      debug: vi.fn<(message: string) => void>(),
    },
    { url: new URL(url) },
  );
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2020-06-15T12:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("datePlugin", () => {
  it("ignores URLs that are not date: URLs", async () => {
    await expect(check("https://example.com/2000-01-01")).resolves.toBeNull();
    await expect(check("dates:2000-01-01")).resolves.toBeNull();
  });

  it("reports a past date as expired", async () => {
    await expect(check("date:2000-01-01")).resolves.toEqual({
      title: "2000-01-01T00:00:00.000Z",
      isExpired: true,
      expirationDate: new Date("2000-01-01T00:00:00Z"),
    });
  });

  it("reports a future date as not expired", async () => {
    await expect(check("date:2999-12-31")).resolves.toMatchObject({
      isExpired: false,
      expirationDate: new Date("2999-12-31T00:00:00Z"),
    });
  });

  it("accepts full ISO datetimes", async () => {
    await expect(check("date:2020-06-15T11:59:59Z")).resolves.toMatchObject({
      title: "2020-06-15T11:59:59.000Z",
      isExpired: true,
    });
  });

  it("expires strictly after the given instant", async () => {
    // The comparison is `expirationDate < now`: at the exact instant the
    // date is not yet expired.
    await expect(check("date:2020-06-15T12:00:00Z")).resolves.toMatchObject({
      isExpired: false,
    });

    vi.setSystemTime(new Date("2020-06-15T12:00:00.001Z"));
    await expect(check("date:2020-06-15T12:00:00Z")).resolves.toMatchObject({
      isExpired: true,
    });
  });

  it("throws on a malformed date", async () => {
    await expect(check("date:not-a-date")).rejects.toThrow(/Invalid/);
  });
});
