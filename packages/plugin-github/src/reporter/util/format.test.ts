import { expect, it } from "vitest";
import { formatDate } from "./format";

it("formats dates as their ISO date part", () => {
  expect(formatDate(new Date("2020-05-06T07:08:09.123Z"))).toBe("2020-05-06");
});
