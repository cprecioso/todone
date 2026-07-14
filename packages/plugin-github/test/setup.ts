// In CI these are all set for real (GITHUB_ACTIONS flips the plugin's
// defaults, GITHUB_STEP_SUMMARY points at the actual job summary), and on a
// developer machine a GITHUB_TOKEN may be exported. Scrub them before any
// test module is imported — src/options.ts reads GITHUB_ACTIONS at module
// evaluation time.
for (const name of [
  "GITHUB_ACTIONS",
  "GITHUB_TOKEN",
  "GITHUB_REPOSITORY",
  "GITHUB_SERVER_URL",
  "GITHUB_SHA",
  "GITHUB_STEP_SUMMARY",
]) {
  delete process.env[name];
}
