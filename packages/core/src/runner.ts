import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import { analyze } from "./analyzer";
import { TodoneOptions, normalizeOptions } from "./options";
import { PluginContainer } from "./plugins";

export const getAnalysisStreams = async (
  files: AsyncIterable<t.File>,
  partialOptions: Partial<TodoneOptions> = {},
) => {
  const options = normalizeOptions(partialOptions);
  const pluginContainer = new PluginContainer(options);

  const [file$, returnFile$] = ReadableStream.from(files).tee();

  const [match$, returnMatch$] = file$
    .pipeThrough(s.flatMap((file) => analyze(file, options)))
    .tee();

  const returnResult$ = match$.pipeThrough(
    s.map(
      async (match) =>
        ({ match, result: await pluginContainer.check(match) }) as t.Result,
    ),
  );

  return {
    files: returnFile$,
    matches: returnMatch$,
    results: returnResult$,
  };
};
