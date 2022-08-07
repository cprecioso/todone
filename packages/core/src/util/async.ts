export const collectAsyncIterable = async <T>(it: AsyncIterable<T>) => {
  const items = [];
  for await (const el of it) items.push(el);
  return items;
};
