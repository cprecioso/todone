# @todone/plugin-npm

A {@link todone} plugin that will alert you when an npm package publishes a version that satisfies a semver range.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import npmPlugin from "@todone/plugin-npm";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [npmPlugin()],
});
```

## Options

- `registry`: Base URL of the npm registry to query. Defaults to the `NPM_CONFIG_REGISTRY` environment variable, or the public npm registry (`https://registry.npmjs.org/`).

## Usage

Add a `@TODO` comment with a package specifier in the format `npm:package-name@semver-range`. The TODO expires as soon as any published version of the package satisfies the range:

```js
// @TODO npm:react@>=20
// Migrate to the new API once React 20 is released.
legacyReactApi();

// Scoped packages work too:
// @TODO npm:@types/node@^26
```

Any [semver range](https://github.com/npm/node-semver#ranges) works, but it can't contain spaces, since the specifier has to be a valid URL. Prefer space-free forms like `^1.2.3`, `>=2`, or `1.x`; if you really need one with spaces, URL-encode it (e.g. `npm:foo@%3E%3D1.2.3%20%3C2.0.0` for `>=1.2.3 <2.0.0`).
