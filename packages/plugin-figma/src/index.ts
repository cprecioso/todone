import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/plugin";
import ky from "ky";
import * as z from "zod/v4";
import { commentsResponseSchema } from "./api";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?figma.com",
  pathname: "/file/:fileID",
  hash: "#:commentID",
});

export default definePlugin(
  {
    token: {
      schema: z.string(),
      envName: "FIGMA_TOKEN",
    },
  },
  async ({ token }) => {
    const client = ky.extend({
      prefixUrl: "https://api.figma.com/v1",
      headers: { "X-FIGMA-TOKEN": token },
    });

    return {
      name: "Figma Comment",

      pattern,

      async check({ url }) {
        const result = pattern.exec(url);
        assert(result);

        const {
          pathname: {
            groups: { fileID },
          },
          hash: {
            groups: { commentID },
          },
        } = result;

        const data = commentsResponseSchema.parse(
          await client.get(`files/${fileID}/comments`).json(),
        );

        const comment = data.comments?.find(
          (comment) => comment.id === commentID,
        );
        assert(comment, "No such comment");

        const closeDate = comment.resolved_at;
        const isExpired = Boolean(closeDate);

        return { isExpired, expirationDate: closeDate || undefined };
      },
    };
  },
);
