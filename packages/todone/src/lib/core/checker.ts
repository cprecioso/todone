import type { Checker, Factory } from "#/plugin";
import * as t from "#/types";

export const makeAggregateChecker = async (
  factories: readonly Factory<Checker>[],
) => {
  const instances = await Promise.all(
    factories.map(async (factory) => {
      const checker = await factory.make();
      return { id: factory.id, value: checker };
    }),
  );

  return (match: t.Match): Promise<t.Result> => {
    const { url } = match;
    return Promise.any(
      instances.map(async (inst): Promise<t.Result> => {
        try {
          const result = await inst.value.checkMatch({ url });
          if (!result) throw new Error("No result for " + url.toString());
          return { url, result, match };
        } catch (error) {
          throw new Error("Error in plugin " + inst.id, { cause: error });
        }
      }),
      // No checker responded for this URL; let reporters surface it.
    ).catch(() => ({ url, result: null, match }));
  };
};
