import { re } from "@todone/internal-util/regex";
import type * as t from "@todone/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import * as pkg from "../package.json" with { type: "json" };
import { Options } from "./options";

export class StreamConsumingError extends Data.Error<{ cause: unknown }> {}

export class Analyzer extends Effect.Service<Analyzer>()(
  `${pkg.name}/Analyzer`,
  {
    effect: Effect.gen(function* () {
      const { keyword } = yield* Options;
      const matcher = re`${keyword}\s+?(\S+)`("dgu");

      return {
        findMatches:
          <E, R, TFile extends t.File<E, R>>() =>
          (file: TFile) =>
            pipe(
              Stream.decodeText(file.getContent),
              Stream.splitLines,
              Stream.zipWithIndex,
              Stream.mapConcat(([text, line]) =>
                text
                  .matchAll(matcher)
                  .filter(([, url]) => URL.canParse(url))
                  .map((match): t.Match<E, R, TFile> => {
                    const url = new URL(match[1]);
                    const [startIndex] = match.indices![0];
                    return {
                      file,
                      position: {
                        line: line + 1,
                        column: startIndex + 1,
                      },
                      url,
                    };
                  }),
              ),
            ),
      };
    }),
  },
) {}
