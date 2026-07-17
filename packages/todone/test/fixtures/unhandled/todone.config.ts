export default {
  globs: ["input/**"],
  plugins: [
    {
      name: "fixture-plugin",
      async checkMatch({ url }: { url: URL }) {
        if (url.protocol !== "fixture:") return null;
        return { title: `Fixture ${url.pathname}`, isExpired: false };
      },
    },
  ],
};
