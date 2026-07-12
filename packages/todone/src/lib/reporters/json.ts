import type { ReporterFn } from "#/plugin";
import * as path from "node:path";
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

export const jsonReporter = (): ReporterFn => async () => {
  const outputItem = jsonCodec(OutputItem);

  return {
    warn: async (message: string) => console.warn(message),
    info: async (message: string) => console.info(message),
    debug: async (message: string) => console.debug(message),

    reportFile: async (file) =>
      console.log(
        outputItem.encode({ type: "file", location: file.localPath }),
      ),

    reportMatch: async ({ url, file, position }) =>
      console.log(
        outputItem.encode({
          type: "match",
          url,
          location: file.localPath,
          ...position,
        }),
      ),

    reportResult: async ({ url, result }) => {
      if (result) {
        console.log(outputItem.encode({ type: "result", url, ...result }));
      }
    },

    async [Symbol.asyncDispose]() {},
  };
};
