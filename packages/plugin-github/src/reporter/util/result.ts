import { CheckerResult } from "todone/plugin";
import * as t from "todone/types";

export interface ExpiredResult extends t.Result {
  result: CheckerResult;
}

export const isExpiredResult = (result: t.Result): result is ExpiredResult =>
  result.result?.isExpired ?? false;
