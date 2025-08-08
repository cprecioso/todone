/** @jsx h */
void h; // If we don't use `h`, prettier will remove it

import * as core from "@actions/core";
import pMap from "p-map";
import h from "vhtml";
import { Result } from "./util";

type Row = [file: string, url: string, expired: string, expirationDate: string];

export const makeSummary = async (items: Result[]) => {
  const flatMatches = items.flatMap(({ result }) =>
    result.matches.map((match) => ({
      url: result.url,
      result: result.result,
      match,
    })),
  );

  const rows = await pMap(
    flatMatches,
    async ({ url, result, match }): Promise<Row> => {
      const fileUrl = await match.file.getUrl(match.position.line);
      let location: string;
      if (fileUrl) {
        location = <a href={fileUrl}>{match.file.location}</a>;
      } else {
        location = match.file.location;
      }

      const resultUrl = url.toString();

      return [
        location,
        <a href={resultUrl}>{resultUrl}</a>,
        result ? (result.isExpired ? "❗" : "⌛") : "",
        result
          ? result.expirationDate?.toDateString() || "No expiration date"
          : "",
      ] as const;
    },
  );

  await core.summary
    .addHeading("TODOs found")
    .addTable([
      (["File", "URL", "Expired", "Expiration Date"] satisfies Row).map(
        (data) => ({ data: data, header: true }),
      ),
      ...rows,
    ])
    .write();
};
