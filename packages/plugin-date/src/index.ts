import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/types";

const issuePattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

export default definePlugin("DatePlugin", async () => ({
  async checkExpiration({ url }) {
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
}));
