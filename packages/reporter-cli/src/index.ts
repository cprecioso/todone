import type { Reporter } from "@todone/types";

const reporter: Reporter = async function (results) {
  let hasExpiredItems = false;
  for await (const { match, result } of results) {
    console.log(
      `${match.file}${
        match.start ? `:${match.start?.line}:${match.start?.column}` : ""
      }\n\t${match.url}\n\t${result.isExpired ? "Still waiting" : "Expired!"}`
    );
    hasExpiredItems ||= result.isExpired;
  }

  process.exitCode = hasExpiredItems ? 1 : 0;
};

export default reporter;
