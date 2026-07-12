# @todone/plugin-figma

A {@link todone} plugin that will alert you when a comment in a Figma file has been resolved.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import figmaPlugin from "@todone/plugin-figma";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [figmaPlugin({ token: process.env.FIGMA_TOKEN })],
});
```

## Options

- `token`: The Figma API token to use for authentication. You can generate a personal access token from your Figma account settings. Defaults to the `FIGMA_TOKEN` environment variable.

The Figma API always requires a token: without one the plugin emits a warning when created, and checking any Figma URL fails with an error.

## Usage

Add a `@TODO` comment with a link to a Figma comment:

```css
.box {
  /*
    @TODO https://www.figma.com/design/ABCDEFGHJ123124?node-id=193-21#1021383481
    The designer mentioned this color is too strong and should be changed.
  */
  background-color: #f00;
}
```
