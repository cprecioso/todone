export const collectAsyncIterable = async <T>(it: AsyncIterable<T>) => {
  const items = [];
  for await (const el of it) items.push(el);
  return items;
};

export const asyncMap = async <T, U>(
  it: Iterable<T>,
  fn: (el: T) => Promise<U>
) =>
  await collectAsyncIterable(
    (async function* () {
      for (const el of it) yield fn(el);
    })()
  );
