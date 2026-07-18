import * as z from "zod";

export const shorthands = <
  CanonicalInput,
  CanonicalOutput,
  const ShorthandInputs,
>(
  canonicalSchema: z.ZodType<CanonicalOutput, CanonicalInput>,
  shorthandSchemas: readonly z.ZodType<CanonicalInput, ShorthandInputs>[],
) =>
  z.union([
    canonicalSchema,
    ...shorthandSchemas.map((schema) => schema.pipe(canonicalSchema)),
  ]);
