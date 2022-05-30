import escapeStringRegexp from "escape-string-regexp";

export const re = (
  template: TemplateStringsArray,
  ...substitutions: readonly string[]
) => {
  let reText = "";
  let i = 0;
  for (const templatePart of template.raw) {
    reText += templatePart;
    const substitutionPart = substitutions[i];
    if (substitutionPart != null) {
      reText += escapeStringRegexp(substitutionPart);
    }
    i++;
  }

  return (flags?: string) => new RegExp(reText, flags);
};
