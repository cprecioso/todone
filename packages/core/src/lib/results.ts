import { toTransformStream } from "@std/streams";
import * as t from "@todone/types";
import { PluginContainer } from "../plugins";

const makeResult = async (
  { url, match }: { url: URL; match: t.Match },
  pluginContainer: PluginContainer,
) => ({
  url,
  result: await pluginContainer.check(url),
  matches: [match],
});

export const generateResultStream = (
  pluginContainer: PluginContainer,
): TransformStream<{ url: URL; match: t.Match }, t.Result> =>
  toTransformStream(async function* (source) {
    const map = new Map<string, t.Result & { matches: t.Match[] }>();

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

    yield* map.values();
  });
