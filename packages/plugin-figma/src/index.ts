import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin, Match } from "@todone/types";
import { CommentsResponse } from "./api";

class FigmaCommentPlugin {
  static displayName = "Figma Comment";

  static readonly pattern = new URLPattern({
    protocol: "http{s}?",
    hostname: "{www.}?figma.com",
    pathname: "/file/:fileID",
    hash: "#:commentID",
  });

  static async make() {
    const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
    assert(FIGMA_TOKEN, "Please provide a FIGMA_TOKEN environment variable");
    return new this(FIGMA_TOKEN);
  }

  readonly #token: string;
  constructor(token: string) {
    this.#token = token;
  }

  async check({ url }: Match) {
    const result = FigmaCommentPlugin.pattern.exec(url);
    assert(result);

    const {
      pathname: {
        groups: { fileID },
      },
      hash: {
        groups: { commentID },
      },
    } = result;

    const data = (await (
      await fetch(`https://api.figma.com/v1/files/${fileID}/comments`, {
        headers: { "X-FIGMA-TOKEN": this.#token },
      })
    ).json()) as CommentsResponse;

    const comment = data.comments?.find((comment) => comment.id === commentID);
    assert(comment, "No such comment");

    const closeDate = comment.resolved_at && new Date(comment.resolved_at);
    const isExpired = Boolean(closeDate);

    return { isExpired, expirationDate: closeDate || undefined };
  }
}

export default definePlugin(FigmaCommentPlugin);
