export const partition = <T>(
  input: Iterable<T>,
  predicate: (item: T) => boolean,
) => {
  const trues: T[] = [];
  const falses: T[] = [];

  for (const item of input) {
    if (predicate(item)) trues.push(item);
    else falses.push(item as any);
  }

  return { trues, falses };
};
