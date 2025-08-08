import * as t from "@todone/types";
import { PluginContainer } from "../plugins";

const makeResult = async <File extends t.File>(
  { url, match }: { url: URL; match: t.Match<File> },
  pluginContainer: PluginContainer,
) => ({
  url,
  result: await pluginContainer.check(url),
  matches: [match],
});

export const generateResultStream = async <File extends t.File>(
  pluginContainer: PluginContainer,
  source: ReadableStream<{ url: URL; match: t.Match<File> }>,
): Promise<IteratorObject<t.Result<File>>> => {
  const map = new Map<string, t.Result<File> & { matches: t.Match<File>[] }>();

  for await (const { url, match } of source) {
    const urlString = url.toString();

    const result = map.get(urlString);
    if (result) {
      result.matches.push(match);
      continue;
    } else {
      const result = await makeResult({ match, url }, pluginContainer);
      map.set(urlString, result);
    }
  }

  return map.values();
};
