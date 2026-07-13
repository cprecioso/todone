import type { Reporter } from "#/plugin";
import * as path from "node:path";
import { EmptyObject } from "type-fest";
import * as z from "zod";

const stringToURLCodec = z.codec(z.url(), z.instanceof(URL), {
  decode: (urlString) => new URL(urlString),
  encode: (url) => url.href,
});

const jsonCodec = <T extends z.ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString);
      } catch (err: any) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: err.message,
        });
        return z.NEVER;
      }
    },
    encode: (value) => JSON.stringify(value),
  });

const AbsolutePath = z
  .string()
  .nonempty()
  .refine((str) => path.isAbsolute(str), {
    error: "Expected an absolute path",
  });

const FileItem = z.object({
  type: z.literal("file"),
  location: AbsolutePath,
});

const MatchItem = z.object({
  type: z.literal("match"),
  url: stringToURLCodec,
  location: AbsolutePath,
  line: z.number().nonnegative(),
  column: z.number().nonnegative(),
});

const ResultItem = z.object({
  type: z.literal("result"),
  url: stringToURLCodec,
  title: z.string(),
  isExpired: z.boolean(),
  expirationDate: z.date().optional(),
});

const OutputItem = z.union([FileItem, MatchItem, ResultItem]);
type OutputItem = z.infer<typeof OutputItem>;

export type JsonReporterOptions = EmptyObject;

export const jsonReporter =
  async ({}: JsonReporterOptions = {}): Promise<Reporter> => {
    const outputItem = jsonCodec(OutputItem);

    return {
      async file(file) {
        console.log(
          outputItem.encode({ type: "file", location: file.fullPath }),
        );
      },

      async match({ url, file, position }) {
        console.log(
          outputItem.encode({
            type: "match",
            url,
            location: file.fullPath,
            ...position,
          }),
        );
      },

      async result({ url, result }) {
        if (result) {
          console.log(outputItem.encode({ type: "result", url, ...result }));
        }
      },

      async [Symbol.asyncDispose]() {},
    };
  };
