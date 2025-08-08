import { definePlugin } from "@todone/plugin";
import { isPast } from "date-fns";
import * as z from "zod/v4-mini";

const pattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

const patternResultSchema = z.object({
  pathname: z.object({
    groups: z.object({
      date: z.string(),
    }),
  }),
});

/** The plugin factory. Doesn't take any options. */
export default definePlugin(null, async () => ({
  name: "Date",

  pattern,

  async check({ url }) {
    const result = patternResultSchema.parse(pattern.exec(url));
    const { date } = result.pathname.groups;

    const expirationDate = new Date(date);
    const isExpired = isPast(expirationDate);

    return {
      title: date,
      isExpired,
      expirationDate,
    };
  },
}));
