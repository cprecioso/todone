import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

require("cross-fetch/polyfill");

export default fetch;
