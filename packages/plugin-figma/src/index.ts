import assert from "node:assert/strict";
import { PluginFactory } from "todone/plugin";
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

const plugin: PluginFactory = {
  id: pkg.name,
  make: async () => {
    const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
    assert(FIGMA_TOKEN, "FIGMA_TOKEN environment variable is required");

    const api = createFigmaApi(FIGMA_TOKEN);

    return {
      checkers: [
        {
          id: `${pkg.name}/figma-comment`,
          make: async () => ({
            checkMatch: async ({ url }) => {
              const patternResult = pattern.exec(url);
              if (!patternResult) return null;

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

              const comment = comments.find(
                (comment) => comment.id === commentID,
              );
              if (!comment) throw new Error("Comment not found: " + commentID);

              const closeDate = comment.resolved_at;
              const isExpired = Boolean(closeDate);

              return {
                title: `Figma comment from ${comment.user.handle}`,
                isExpired,
                expirationDate: closeDate || undefined,
              };
            },
          }),
        },
      ],
    };
  },
};

export default plugin;
