import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { createFigmaApi } from "./api";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?figma.com",
  pathname: "/file/:fileID",
  hash: "#:commentID",
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      fileID: z.string(),
    }),
  }),
  hash: z.object({
    groups: z.object({
      commentID: z.string(),
    }),
  }),
});

export interface FigmaPluginOptions {
  /** Figma API token. Defaults to `process.env.FIGMA_TOKEN`. */
  token?: string;
}

const figmaPlugin = ({
  token = process.env.FIGMA_TOKEN,
}: FigmaPluginOptions = {}): Plugin => {
  if (!token) {
    process.emitWarning(
      "No Figma token provided (`token` option or FIGMA_TOKEN env var). " +
        "Any Figma URL check will fail.",
      { code: "TODONE_FIGMA_NO_TOKEN" },
    );
  }

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      if (!token) {
        throw new Error(
          `A Figma token is required to check ${url}. ` +
            `Set the \`token\` option or the FIGMA_TOKEN environment variable.`,
        );
      }

      const api = createFigmaApi(token);

      const {
        pathname: {
          groups: { fileID },
        },
        hash: {
          groups: { commentID },
        },
      } = PatternResult.parse(patternResult);

      const { comments } = await api.Files.GetComments({
        path: { fileID: fileID },
      });
      if (!comments) throw new Error("File not found: " + fileID);

      const comment = comments.find((comment) => comment.id === commentID);
      if (!comment) throw new Error("Comment not found: " + commentID);

      const closeDate = comment.resolved_at;
      const isExpired = Boolean(closeDate);

      return {
        title: `Figma comment from ${comment.user.handle}`,
        isExpired,
        expirationDate: closeDate || undefined,
      };
    },
  };
};

export default figmaPlugin;
