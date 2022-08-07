import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

require("cross-fetch/polyfill");

const _fetch = fetch;
export default _fetch;

const _Request = Request;
export { _Request as Request };
