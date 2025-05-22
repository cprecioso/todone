import { TextLineStream } from "@std/streams";
import { truthy } from "@todone/internal-util/bool";
import { re } from "@todone/internal-util/regex";
import { filter, map } from "@todone/internal-util/stream";
import { tryURL } from "@todone/internal-util/url";
import type { File, Match } from "@todone/types";
import { TodoneOptions } from "./options";

export const analyze = (file: File, options: TodoneOptions) => {
  const matcher = re`${options.keyword}\s+?(\S+)`("dgu");

  const contentsStream = file.getContent();

  return contentsStream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(
      map((lineText, line): Match | undefined => {
        for (const match of lineText.matchAll(matcher)) {
          const url = tryURL(match[1]);
          if (url) {
            const indices = (match as any).indices[0] as [number, number];
            return {
              file,
              url,
              start: { line, column: indices[0] + 1 },
              end: { line, column: indices[1] + 1 },
            };
          }
        }
      }),
    )
    .pipeThrough(filter(truthy));
};
