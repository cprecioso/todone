import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };

const pattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

const isoToDate = z.codec(z.union([z.iso.datetime(), z.iso.date()]), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      date: isoToDate,
    }),
  }),
});

const datePlugin = (): Plugin => ({
  name: pkg.name,
  checkMatch: async ({ url }) => {
    const patternResult = pattern.exec(url);
    if (!patternResult) return null;

    const {
      pathname: {
        groups: { date: expirationDate },
      },
    } = PatternResult.parse(patternResult);

    const isExpired = +expirationDate < Date.now();

    return {
      title: expirationDate.toISOString(),
      isExpired,
      expirationDate,
    };
  },
});

export default datePlugin;
