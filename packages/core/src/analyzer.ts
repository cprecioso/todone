import { TextLineStream } from "@std/streams";
import { re } from "@todone/internal-util/regex";
import { compactMap } from "@todone/internal-util/stream";
import { tryURL } from "@todone/internal-util/url";
import type * as t from "@todone/types";
import { Options } from "./options";

export const makeAnalyzer = <File extends t.File>(options: Options) => {
  const matcher = re`${options.keyword}\s+?(\S+)`("dgu");

  return (file: File) => {
    const contentsStream = file.getContent();

    return contentsStream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeThrough(
        compactMap(
          (text, line): { url: URL; match: t.Match<File> } | undefined => {
            for (const match of text.matchAll(matcher)) {
              const url = tryURL(match[1]);
              if (url) {
                const [startIndex] = match.indices![0];
                return {
                  url,
                  match: {
                    file,
                    position: { line: line + 1, column: startIndex + 1 },
                  },
                };
              }
            }
          },
        ),
      );
  };
};
