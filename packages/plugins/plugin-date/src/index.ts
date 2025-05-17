import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin, Match } from "@todone/types";

class DatePlugin {
  static readonly pattern = new URLPattern({
    protocol: "date",
    hostname: "",
    pathname: ":date",
  });

  static async make() {
    return new this();
  }

  async check({ url }: Match) {
    const result = DatePlugin.pattern.exec(url);
    assert(result);

    const { date } = result.pathname.groups;
    if (!date) return null;

    const expirationDate = new Date(date);
    const isExpired = new Date() >= expirationDate;

    return { isExpired, expirationDate };
  }
}

export default definePlugin(DatePlugin);
