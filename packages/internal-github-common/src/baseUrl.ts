export const GITHUB_API_BASE_URL = "api.github.com";

export const normalizeHostname = (hostname: string) =>
  /^(?:(?:api|www)\.)?github\.com$/.test(hostname)
    ? GITHUB_API_BASE_URL
    : hostname;

export const getApiBaseUrl = ({
  protocol,
  hostname,
}: {
  protocol: string;
  hostname: string;
}) => {
  const normalized = normalizeHostname(hostname);
  return normalized === GITHUB_API_BASE_URL
    ? new URL("https://api.github.com/")
    : new URL(`${protocol}//${hostname}/api/v3/`);
};
