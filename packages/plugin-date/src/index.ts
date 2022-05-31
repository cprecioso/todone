import URLPattern from "@todone/internal-urlpattern";
import type { PluginInstance } from "@todone/types";

const issuePattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

const DatePlugin = (): PluginInstance => {
  return {
    name: "Date",

    async checkExpiration(url, { match }) {
      const result = issuePattern.exec(url);
      if (!result) return null;

      const { date } = result.pathname.groups;
      if (!date) return null;

      const expirationDate = new Date(date);
      const isExpired = new Date() >= expirationDate;

      return {
        isExpired,
        expiration: { date: expirationDate, isApproximation: false },
      };
    },
  };
};

export default DatePlugin;
