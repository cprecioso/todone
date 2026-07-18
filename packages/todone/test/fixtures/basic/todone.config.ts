import { defineConfig } from "todone/config";

// Self-contained on purpose: no imports, so this fixture needs neither the
// built `todone` package nor any plugin package to be resolvable.
export default defineConfig({
  include: ["input/**"],
  plugins: [
    {
      name: "fixture-plugin",
      async checkMatch({ url }: { url: URL }) {
        if (url.protocol !== "fixture:") return null;
        return {
          title: `Fixture ${url.pathname}`,
          isExpired: url.pathname.startsWith("expired"),
          expirationDate: url.searchParams.has("date")
            ? new Date("2000-01-02T00:00:00Z")
            : undefined,
        };
      },
    },
  ],
});
