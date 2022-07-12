import fetch from "@todone/internal-fetch";
import URLPattern from "@todone/internal-urlpattern";
import type { PluginInstance } from "@todone/types";
import assert from "node:assert/strict";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?figma.com",
  pathname: "/file/:fileID",
  hash: "#:commentID",
});

const FigmaCommentPlugin = (): PluginInstance => {
  const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
  assert(FIGMA_TOKEN, "Please provide a FIGMA_TOKEN environment variable");

  return {
    name: "Figma comment",

    async checkExpiration(url) {
      const result = issuePattern.exec(url);
      if (!result) return null;

      const {
        pathname: {
          groups: { fileID },
        },
        hash: {
          groups: { commentID },
        },
      } = result;

      const data: any = await (
        await fetch(`https://api.figma.com/v1/files/${fileID}/comments`, {
          headers: { "X-FIGMA-TOKEN": FIGMA_TOKEN },
        })
      ).json();

      const comment = data.comments.find(
        (comment: any) => comment.id === commentID
      );
      assert(comment, "No such comment");

      const closeDate = comment.resolved_at && new Date(comment.resolved_at);
      const isExpired = Boolean(closeDate);

      return {
        isExpired,
        expiration: closeDate
          ? { date: closeDate, isApproximation: false }
          : null,
      };
    },
  };
};

export default FigmaCommentPlugin;
