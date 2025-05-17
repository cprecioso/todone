export const tryURL = (string: string) => {
  try {
    return new URL(string);
  } catch {
    return false;
  }
};
