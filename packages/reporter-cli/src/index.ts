import type { Result } from "@todone/types";

const reporter = async function (results: AsyncIterable<Result>) {
  let hasExpiredItems = false;
  for await (const { match, result } of results) {
    console.log(
      `${match.file}${
        match.start ? `:${match.start?.line}:${match.start?.column}` : ""
      }\n\t${match.url}\n\t${result.isExpired ? "Expired!" : "Still waiting"}`
    );
    hasExpiredItems ||= result.isExpired;
  }

  process.exitCode = hasExpiredItems ? 1 : 0;
};

export default reporter;
