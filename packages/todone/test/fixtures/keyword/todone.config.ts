import { defineConfig } from "todone/config";

export default defineConfig({
  keyword: "*TODO",
  include: ["input/**"],
  plugins: [
    {
      name: "fixture-plugin",
      async checkMatch({ url }: { url: URL }) {
        if (url.protocol !== "fixture:") return null;
        return { title: `Fixture ${url.pathname}`, isExpired: true };
      },
    },
  ],
});
