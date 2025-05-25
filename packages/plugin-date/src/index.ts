import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/plugin";

const pattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

/** The plugin factory. Doesn't take any options. */
export default definePlugin(null, async () => ({
  name: "Date",

  pattern,

  async check({ url }) {
    const result = pattern.exec(url);
    assert(result);

    const { date } = result.pathname.groups;
    if (!date) return null;

    const expirationDate = new Date(date);
    const isExpired = new Date() >= expirationDate;

    return { isExpired, expirationDate };
  },
}));
