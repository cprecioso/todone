import * as z from "zod";

export const shorthands = <
  CanonicalInput,
  CanonicalOutput,
  const S extends readonly z.ZodType<CanonicalInput>[],
>(
  canonicalSchema: z.ZodType<CanonicalOutput, CanonicalInput>,
  shorthandSchemas: S,
) =>
  z.union([
    canonicalSchema,
    ...shorthandSchemas.map((schema) => schema.pipe(canonicalSchema)),
  ]) as z.ZodType<CanonicalOutput, CanonicalInput | z.input<S[number]>>;
