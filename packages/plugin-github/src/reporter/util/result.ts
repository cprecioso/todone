import * as Option from "effect/Option";
import { CheckerResult } from "todone/plugin";
import * as t from "todone/types";

export type Result = t.Result;

export interface ExpiredResult extends Result {
  result: Option.Some<CheckerResult>;
}

export const isExpiredResult = (result: Result): result is ExpiredResult =>
  Option.match(result.result, {
    onNone: () => false,
    onSome: ({ isExpired }) => isExpired,
  });

/** The {@link CheckerResult} of an expired result, already unwrapped. */
export const expiredResultValue = (result: ExpiredResult): CheckerResult =>
  result.result.value;
