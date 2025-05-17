export type FalsyValues = false | 0 | 0n | "" | null | undefined;

export const truthy = <T>(value: T): value is Exclude<T, FalsyValues> =>
  Boolean(value);

export const falsy = <T>(value: T): value is T & FalsyValues => !value;
