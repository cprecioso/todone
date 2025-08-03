import { toTransformStream } from "@std/streams/to-transform-stream";

export const map = <T, U>(fn: (item: T, index: number) => U) =>
  toTransformStream(async function* (source: ReadableStream<T>) {
    let i = 0;
    for await (const item of source) {
      yield await fn(item, i);
      i++;
    }
  });

export const compactMap = <T, U>(
  fn: (item: T, index: number) => U | undefined | null,
) =>
  toTransformStream(async function* (source: ReadableStream<T>) {
    let i = 0;
    for await (const item of source) {
      const result = fn(item, i);
      if (result != null) yield result;
      i++;
    }
  });

export const filter = <T, U extends T>(
  fn: (item: T, index: number) => item is U,
) =>
  toTransformStream(async function* (source: ReadableStream<T>) {
    let i = 0;
    for await (const item of source) {
      if (fn(item, i)) yield item;
      i++;
    }
  });

export const tap = <T>(fn: (item: T, index: number) => void | Promise<void>) =>
  map(async (item: T, i) => {
    await fn(item, i);
    return item;
  });

export const flatMap = <T, U>(
  fn: (item: T, index: number) => Iterable<U> | AsyncIterable<U>,
) =>
  toTransformStream(async function* (source: ReadableStream<T>) {
    let i = 0;
    for await (const item of source) {
      yield* fn(item, i);
      i++;
    }
  });

export const create = <T>(
  fn: () => ReadableStream<T> | Promise<ReadableStream<T>>,
) =>
  ReadableStream.from(
    (async function* () {
      yield* await fn();
    })(),
  );

export const tee3 = <T>(stream: ReadableStream<T>) => {
  const [inner, a] = stream.tee();
  const [b, c] = inner.tee();
  return [a, b, c] as const;
};

// @TODO https://github.com/actions/runner/issues/3600
// Once GitHub Actions supports Node.js 22, we can use Array.fromAsync directly
export const toArray = async <T>(stream: ReadableStream<T>): Promise<T[]> => {
  const result: T[] = [];
  for await (const item of stream) {
    result.push(item);
  }
  return result;
};

export const reduce = async <T, U>(
  stream: ReadableStream<T>,
  fn: (acc: U, item: T, index: number) => U,
  initialValue: U,
) => {
  let i = 0;
  let acc = initialValue;
  for await (const item of stream) {
    acc = fn(acc, item, i);
    i++;
  }
  return acc;
};
