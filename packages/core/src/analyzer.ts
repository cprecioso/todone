import { TextLineStream } from "@std/streams";
import { re } from "@todone/internal-util/regex";
import { compactMap } from "@todone/internal-util/stream";
import { tryURL } from "@todone/internal-util/url";
import type { File, Match } from "@todone/types";
import { TodoneOptions } from "./options";

export const makeAnalyzer = (options: TodoneOptions) => {
  const matcher = re`${options.keyword}\s+?(\S+)`("dgu");

  return (file: File) => {
    const contentsStream = file.getContent();

    return contentsStream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeThrough(
        compactMap((text, line) => {
          for (const match of text.matchAll(matcher)) {
            const url = tryURL(match[1]);
            if (url) {
              const indices = (match as any).indices[0] as [number, number];
              return {
                file,
                url,
                start: { line, column: indices[0] + 1 },
                end: { line, column: indices[1] + 1 },
              } as Match;
            }
          }
        }),
      );
  };
};
