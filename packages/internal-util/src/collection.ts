export const mapMapEntries = <K, V, K_, V_>(
  map: ReadonlyMap<K, V>,
  fn: (entry: [K, V], index: number) => readonly [K_, V_],
) => new Map(map.entries().map(fn));

export const mapMapKeys = <K, V, K_>(
  map: ReadonlyMap<K, V>,
  fn: (key: K, value: V, index: number) => K_,
) =>
  mapMapEntries(map, ([key, value], i) => [fn(key, value, i), value] as const);

export const mapMapValues = <K, V, V_>(
  map: ReadonlyMap<K, V>,
  fn: (value: V, key: K, index: number) => V_,
) => mapMapEntries(map, ([key, value], i) => [key, fn(value, key, i)] as const);

export const concat = function* <T>(...iterables: Iterable<T>[]) {
  for (const iterable of iterables) {
    yield* iterable;
  }
};
