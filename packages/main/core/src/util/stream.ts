import { toTransformStream } from "@std/streams";

export const map = <T, U>(fn: (item: T, index: number) => U) =>
  toTransformStream(async function* (source: ReadableStream<T>) {
    let i = 0;
    for await (const item of source) {
      yield await fn(item, i);
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

export const unasync = <T>(fn: () => Promise<ReadableStream<T>>) =>
  ReadableStream.from(
    (async function* () {
      yield* await fn();
    })(),
  );

export const teeMap = <T, U>(
  stream: ReadableStream<T>,
  fn: (item: T, index: number) => U,
) => {
  const [value$, forMap$] = stream.tee();
  const mapped$ = forMap$.pipeThrough(map(fn));
  return [value$, mapped$] as const;
};
