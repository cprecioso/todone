# @todone/plugin-caniuse

A {@link todone} plugin that will alert you when a feature is supported by your target browsers.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import caniusePlugin from "@todone/plugin-caniuse";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [caniusePlugin({ browserslist: "defaults" })],
});
```

## Options

- `browserslist`: A [browserslist](https://github.com/browserslist/browserslist#queries) query or array of browserslist queries. Defaults to your project's browserslist configuration (including the `BROWSERSLIST` environment variable), or the browserslist defaults.

## Usage

Add a `@TODO` comment with a link to a feature in the [caniuse.com](https://caniuse.com/) database:

```html
<!-- @TODO https://caniuse.com/webp -->
<!-- Use PNG images until we can use WebP ones. -->
<img src="/log.png" alt="Logo" />
```
